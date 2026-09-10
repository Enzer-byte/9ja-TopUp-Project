import { SupplierType } from '../../types';
import { ISupplierAdapter } from './supplierInterface';
import { MockSupplierAdapter } from './mockSupplier';
import { CodaPaymentsSupplierAdapter } from './codaSupplier';
import { ReloadlySupplierAdapter } from './reloadlySupplier';

const instances: Partial<Record<SupplierType, ISupplierAdapter>> = {};

export function getSupplierAdapter(type: SupplierType = 'mock'): ISupplierAdapter {
  if (!instances[type]) {
    switch (type) {
      case 'coda':
        instances[type] = new CodaPaymentsSupplierAdapter();
        break;
      case 'reloadly':
        instances[type] = new ReloadlySupplierAdapter();
        break;
      case 'mock':
      default:
        instances[type] = new MockSupplierAdapter();
        break;
    }
  }
  return instances[type]!;
}
