export type GameId = 'free_fire' | 'codm';

export interface GameInfo {
  id: GameId;
  name: string;
  tagline: string;
  publisher: string;
  bannerUrl: string;
  icon: string;
  currencyName: string;
  playerIdLabel: string;
  playerIdPlaceholder: string;
  playerIdHelp: string;
  requiresZoneId?: boolean;
  zoneIdLabel?: string;
}

export interface ProductPackage {
  id: string;
  gameId: GameId;
  name: string;
  amount: number;
  bonus?: number;
  costPriceNgn: number;
  salePriceNgn: number;
  badge?: string;
  isActive: boolean;
  displayOrder: number;
}

export type OrderStatus = 'pending' | 'processing' | 'success' | 'failed';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type PaymentGateway = 'paystack' | 'flutterwave' | 'mock_sandbox';
export type SupplierType = 'mock' | 'coda' | 'reloadly';

export interface Order {
  id: string;
  orderRef: string;
  gameId: GameId;
  productId: string;
  packageName: string;
  gameCurrencyAmount: number;
  playerId: string;
  zoneId?: string;
  playerNickname?: string;
  customerEmail: string;
  customerPhone?: string;
  amountNgn: number;
  costNgn: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  paymentReference?: string;
  supplierName: SupplierType;
  supplierTxId?: string;
  supplierResponseRaw?: string;
  failureReason?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransactionLog {
  id: string;
  orderId: string;
  orderRef: string;
  eventType: 'payment.init' | 'payment.webhook' | 'supplier.dispatch' | 'supplier.success' | 'supplier.failed' | 'admin.retry';
  idempotencyKey: string;
  gatewayReference?: string;
  status: 'received' | 'processed' | 'duplicate_ignored' | 'error';
  payloadSummary: string;
  timestamp: string;
}

export interface SupplierValidationResult {
  valid: boolean;
  playerName?: string;
  error?: string;
}

export interface SupplierFulfillmentResult {
  success: boolean;
  supplierTxId?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

export interface SystemSettings {
  activeSupplier: SupplierType;
  supplierSimulateFailure: boolean;
  supplierDelayMs: number;
  whatsappSupportNumber: string;
  preferredGateway: PaymentGateway;
}
