import { Order, SupplierFulfillmentResult, SupplierValidationResult, SupplierType } from '../../types';
import { ISupplierAdapter } from './supplierInterface';

/**
 * Coda Payments (Codashop Distribution B2B) Supplier Adapter.
 * Authorized publisher distributor for Garena Free Fire and Activision CODM in Nigeria.
 */
export class CodaPaymentsSupplierAdapter implements ISupplierAdapter {
  readonly supplierType: SupplierType = 'coda';
  readonly name = 'Coda Payments (Codashop B2B)';

  private apiKey: string;
  private merchantId: string;

  constructor(apiKey = 'coda_sandbox_key', merchantId = 'merchant_ng_001') {
    this.apiKey = apiKey;
    this.merchantId = merchantId;
  }

  async validatePlayer(gameId: string, playerId: string, zoneId?: string): Promise<SupplierValidationResult> {
    // In production, hits POST https://api.codapayments.com/airtime/validate/v1
    if (!playerId || playerId.trim().length < 5) {
      return { valid: false, error: 'Coda validation: Invalid in-game Player ID' };
    }

    return {
      valid: true,
      playerName: `Coda_Verified_${playerId.slice(-4)}`,
    };
  }

  async fulfillTopUp(order: Order): Promise<SupplierFulfillmentResult> {
    // In production, hits POST https://api.codapayments.com/airtime/topup/v1
    const txId = `CODA-B2B-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      supplierTxId: txId,
      rawResponse: {
        provider: 'Coda Payments',
        merchantId: this.merchantId,
        codaTxnId: txId,
        resultCode: '0',
        resultDesc: 'Success',
        game: order.gameId,
        targetAccount: order.playerId,
        itemCode: order.productId,
      },
    };
  }

  async checkTransactionStatus(supplierTxId: string): Promise<{ status: 'SUCCESS' | 'FAILED' | 'PENDING'; details?: string }> {
    return {
      status: 'SUCCESS',
      details: `Coda transaction ${supplierTxId} confirmed delivered by publisher.`,
    };
  }
}
