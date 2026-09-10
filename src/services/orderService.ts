import { Order, PaymentGateway, GameId, ProductPackage } from '../types';
import { storage } from './storage';
import { getSupplierAdapter } from './suppliers/supplierFactory';

export class OrderService {
  /**
   * Validate Player ID against the supplier before checkout
   */
  static async validatePlayerId(gameId: GameId, playerId: string, zoneId?: string) {
    const settings = storage.getSettings();
    const adapter = getSupplierAdapter(settings.activeSupplier);
    return await adapter.validatePlayer(gameId, playerId, zoneId);
  }

  /**
   * Initialize a new order in pending status
   */
  static createOrder(params: {
    gameId: GameId;
    pkg: ProductPackage;
    playerId: string;
    zoneId?: string;
    playerNickname?: string;
    customerEmail: string;
    customerPhone?: string;
    paymentGateway: PaymentGateway;
  }): Order {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderRef = `NGT-${new Date().getFullYear()}-${randomDigits}`;
    const settings = storage.getSettings();

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderRef,
      gameId: params.gameId,
      productId: params.pkg.id,
      packageName: params.pkg.name,
      gameCurrencyAmount: params.pkg.amount + (params.pkg.bonus || 0),
      playerId: params.playerId.trim(),
      zoneId: params.zoneId?.trim(),
      playerNickname: params.playerNickname,
      customerEmail: params.customerEmail.trim(),
      customerPhone: params.customerPhone?.trim(),
      amountNgn: params.pkg.salePriceNgn,
      costNgn: params.pkg.costPriceNgn,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentGateway: params.paymentGateway,
      supplierName: settings.activeSupplier,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveOrder(order);

    storage.logTransaction({
      orderId: order.id,
      orderRef: order.orderRef,
      eventType: 'payment.init',
      idempotencyKey: `init_${order.orderRef}`,
      gatewayReference: undefined,
      status: 'received',
      payloadSummary: `Initiated order for ${order.packageName} (₦${order.amountNgn}) to ${order.playerId}`,
    });

    return order;
  }

  /**
   * Simulates/Processes payment success webhook from Paystack or Flutterwave.
   * Includes IDEMPOTENCY check to prevent duplicate top-ups.
   */
  static async handlePaymentWebhook(params: {
    orderId: string;
    gatewayRef: string;
    gateway: PaymentGateway;
    idempotencyKey: string;
  }): Promise<{ success: boolean; message: string; order?: Order }> {
    const { orderId, gatewayRef, gateway, idempotencyKey } = params;

    // 1. Idempotency verification
    if (storage.isIdempotencyKeyProcessed(idempotencyKey)) {
      storage.logTransaction({
        orderId,
        orderRef: 'UNKNOWN',
        eventType: 'payment.webhook',
        idempotencyKey,
        gatewayReference: gatewayRef,
        status: 'duplicate_ignored',
        payloadSummary: `Duplicate webhook ignored for key: ${idempotencyKey}`,
      });
      return {
        success: true,
        message: 'Duplicate webhook acknowledged without reprocessing.',
      };
    }

    const order = storage.getOrderById(orderId);
    if (!order) {
      return { success: false, message: `Order ${orderId} not found.` };
    }

    // Mark key processed immediately
    storage.markIdempotencyKeyProcessed(idempotencyKey);

    // 2. Transition Order to Processing & Payment to Paid
    order.paymentStatus = 'paid';
    order.paymentReference = gatewayRef;
    order.paymentGateway = gateway;
    order.status = 'processing';
    order.updatedAt = new Date().toISOString();
    storage.saveOrder(order);

    storage.logTransaction({
      orderId: order.id,
      orderRef: order.orderRef,
      eventType: 'payment.webhook',
      idempotencyKey,
      gatewayReference: gatewayRef,
      status: 'processed',
      payloadSummary: `Payment verified via ${gateway.toUpperCase()} ref: ${gatewayRef}`,
    });

    // 3. Dispatch Supplier Top-Up fulfillment
    return await this.dispatchSupplierFulfillment(order);
  }

  /**
   * Internal/Public method to dispatch order to the active supplier
   */
  static async dispatchSupplierFulfillment(order: Order): Promise<{ success: boolean; message: string; order: Order }> {
    const settings = storage.getSettings();
    const adapter = getSupplierAdapter(settings.activeSupplier);

    storage.logTransaction({
      orderId: order.id,
      orderRef: order.orderRef,
      eventType: 'supplier.dispatch',
      idempotencyKey: `disp_${order.orderRef}_${order.retryCount}`,
      status: 'processed',
      payloadSummary: `Dispatching to ${adapter.name} for ${order.playerId}`,
    });

    // Call supplier adapter
    const result = await adapter.fulfillTopUp(order);

    if (result.success) {
      order.status = 'success';
      order.supplierTxId = result.supplierTxId;
      order.supplierResponseRaw = JSON.stringify(result.rawResponse || {});
      order.completedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      order.failureReason = undefined;
      storage.saveOrder(order);

      storage.logTransaction({
        orderId: order.id,
        orderRef: order.orderRef,
        eventType: 'supplier.success',
        idempotencyKey: `succ_${order.orderRef}_${order.retryCount}`,
        status: 'processed',
        payloadSummary: `Top-up succeeded. TxId: ${result.supplierTxId}`,
      });

      return { success: true, message: 'Top-up fulfilled successfully!', order };
    } else {
      order.status = 'failed';
      order.failureReason = result.errorMessage || 'Unknown distributor failure';
      order.supplierResponseRaw = JSON.stringify(result.rawResponse || {});
      order.updatedAt = new Date().toISOString();
      storage.saveOrder(order);

      storage.logTransaction({
        orderId: order.id,
        orderRef: order.orderRef,
        eventType: 'supplier.failed',
        idempotencyKey: `fail_${order.orderRef}_${order.retryCount}`,
        status: 'error',
        payloadSummary: `Supplier top-up failed: ${order.failureReason}`,
      });

      return { success: false, message: order.failureReason, order };
    }
  }

  /**
   * Admin manual retry function for failed orders
   */
  static async adminRetryOrder(orderId: string): Promise<{ success: boolean; message: string; order?: Order }> {
    const order = storage.getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.status === 'success') {
      return { success: false, message: 'Order is already marked as successful. Cannot duplicate top-up.' };
    }

    order.retryCount = (order.retryCount || 0) + 1;
    order.status = 'processing';
    order.updatedAt = new Date().toISOString();
    storage.saveOrder(order);

    storage.logTransaction({
      orderId: order.id,
      orderRef: order.orderRef,
      eventType: 'admin.retry',
      idempotencyKey: `retry_${order.orderRef}_${order.retryCount}`,
      status: 'processed',
      payloadSummary: `Admin manually initiated retry #${order.retryCount}`,
    });

    return await this.dispatchSupplierFulfillment(order);
  }
}
