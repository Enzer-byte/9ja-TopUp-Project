import { Order, SupplierFulfillmentResult, SupplierValidationResult, SupplierType } from '../../types';

export interface ISupplierAdapter {
  readonly supplierType: SupplierType;
  readonly name: string;

  /**
   * Validate that the given player ID exists for the specified game before taking payment.
   */
  validatePlayer(gameId: string, playerId: string, zoneId?: string): Promise<SupplierValidationResult>;

  /**
   * Dispatches the digital top-up fulfillment to the publisher/distributor API.
   */
  fulfillTopUp(order: Order): Promise<SupplierFulfillmentResult>;

  /**
   * Queries status of an existing supplier transaction for reconciliation.
   */
  checkTransactionStatus(supplierTxId: string): Promise<{
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    details?: string;
  }>;
}
