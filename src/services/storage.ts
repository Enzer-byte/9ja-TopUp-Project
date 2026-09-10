import { Order, ProductPackage, TransactionLog, SystemSettings } from '../types';
import { INITIAL_PACKAGES } from '../data/initialCatalog';

const STORAGE_KEYS = {
  PACKAGES: 'ngt_packages_v1',
  ORDERS: 'ngt_orders_v1',
  TRANSACTIONS: 'ngt_transactions_v1',
  SETTINGS: 'ngt_settings_v1',
  IDEMPOTENCY: 'ngt_idempotency_keys_v1',
};

const DEFAULT_SETTINGS: SystemSettings = {
  activeSupplier: 'mock',
  supplierSimulateFailure: false,
  supplierDelayMs: 1500,
  whatsappSupportNumber: '+2348012345678',
  preferredGateway: 'paystack',
};

// Seed 3 realistic past orders so the Admin dashboard and tracking test data is immediate
const SEED_ORDERS: Order[] = [
  {
    id: 'ord_seed_1',
    orderRef: 'NGT-2026-88192',
    gameId: 'free_fire',
    productId: 'ff_310',
    packageName: '310 + 31 Diamonds',
    gameCurrencyAmount: 310,
    playerId: '1829401829',
    playerNickname: 'NaijaSniper_99',
    customerEmail: 'tunde.adebayo@gmail.com',
    customerPhone: '+2348031112233',
    amountNgn: 3950,
    costNgn: 3500,
    status: 'success',
    paymentStatus: 'paid',
    paymentGateway: 'paystack',
    paymentReference: 'pstk_ref_981726354',
    supplierName: 'mock',
    supplierTxId: 'MOCK-TX-1741580100-2931',
    supplierResponseRaw: '{"status":"FULFILLED","code":200}',
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600 * 1000 * 4 + 40000).toISOString(),
  },
  {
    id: 'ord_seed_2',
    orderRef: 'NGT-2026-77341',
    gameId: 'codm',
    productId: 'codm_420',
    packageName: '420 CP',
    gameCurrencyAmount: 420,
    playerId: '6748920193820192',
    playerNickname: 'Ghost_NG_Operative',
    customerEmail: 'emeka.okafor@yahoo.com',
    customerPhone: '+2348149998877',
    amountNgn: 6900,
    costNgn: 6100,
    status: 'success',
    paymentStatus: 'paid',
    paymentGateway: 'flutterwave',
    paymentReference: 'flw_ref_449102834',
    supplierName: 'mock',
    supplierTxId: 'MOCK-TX-1741581200-8812',
    supplierResponseRaw: '{"status":"FULFILLED","code":200}',
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600 * 1000 * 2 + 35000).toISOString(),
  },
  {
    id: 'ord_seed_3',
    orderRef: 'NGT-2026-66299',
    gameId: 'free_fire',
    productId: 'ff_100',
    packageName: '100 + 10 Diamonds',
    gameCurrencyAmount: 100,
    playerId: '1920048172_fail',
    playerNickname: 'AbujaKing',
    customerEmail: 'chisom.test@gmail.com',
    customerPhone: '+2349021234567',
    amountNgn: 1350,
    costNgn: 1200,
    status: 'failed',
    paymentStatus: 'paid',
    paymentGateway: 'paystack',
    paymentReference: 'pstk_ref_110293847',
    supplierName: 'mock',
    supplierTxId: undefined,
    failureReason: 'Publisher fulfillment error: Account region mismatch or temporarily locked.',
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
];

export const storage = {
  getPackages(): ProductPackage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    this.savePackages(INITIAL_PACKAGES);
    return INITIAL_PACKAGES;
  },

  savePackages(packages: ProductPackage[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    } catch (e) {
      console.error(e);
    }
  },

  updatePackage(packageId: string, updates: Partial<ProductPackage>): ProductPackage[] {
    const list = this.getPackages().map((pkg) => (pkg.id === packageId ? { ...pkg, ...updates } : pkg));
    this.savePackages(list);
    return list;
  },

  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    this.saveOrders(SEED_ORDERS);
    return SEED_ORDERS;
  },

  saveOrders(orders: Order[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderRef === id);
  },

  getOrderByRef(ref: string): Order | undefined {
    const cleanRef = ref.trim().toLowerCase();
    return this.getOrders().find(
      (o) => o.orderRef.toLowerCase() === cleanRef || o.id.toLowerCase() === cleanRef
    );
  },

  saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }
    this.saveOrders(orders);
    return order;
  },

  getTransactions(): TransactionLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  logTransaction(tx: Omit<TransactionLog, 'id' | 'timestamp'>): TransactionLog {
    const fullTx: TransactionLog = {
      ...tx,
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    const txs = this.getTransactions();
    txs.unshift(fullTx);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
    return fullTx;
  },

  isIdempotencyKeyProcessed(key: string): boolean {
    try {
      const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEMPOTENCY) || '[]');
      return keys.includes(key);
    } catch {
      return false;
    }
  },

  markIdempotencyKeyProcessed(key: string) {
    try {
      const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEMPOTENCY) || '[]');
      if (!keys.includes(key)) {
        keys.push(key);
        localStorage.setItem(STORAGE_KEYS.IDEMPOTENCY, JSON.stringify(keys.slice(-200)));
      }
    } catch (e) {
      console.error(e);
    }
  },

  getSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  },

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.PACKAGES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.IDEMPOTENCY);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
