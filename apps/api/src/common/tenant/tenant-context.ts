import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantStore {
  tenantId: string;
  userId?: string;
  role?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export class TenantContext {
  static getTenantId(): string {
    const store = tenantStorage.getStore();
    if (!store?.tenantId) {
      throw new Error('TenantContext: tenant_id não foi resolvido para esta execução.');
    }
    return store.tenantId;
  }

  static getUserId(): string | undefined {
    return tenantStorage.getStore()?.userId;
  }

  static getStore(): TenantStore | undefined {
    return tenantStorage.getStore();
  }
}
