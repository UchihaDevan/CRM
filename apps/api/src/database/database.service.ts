import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { db, pool, withTenantContext, type AppDatabase } from '@crm/database';
import { TenantContext } from '../common/tenant/tenant-context.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  get rawDb(): AppDatabase {
    return db;
  }

  /**
   * Executa a query dentro de uma transação com o RLS configurado
   * automaticamente via AsyncLocalStorage.
   */
  async withTenant<T>(operation: (tx: typeof db) => Promise<T>): Promise<T> {
    const tenantId = TenantContext.getTenantId();
    return withTenantContext(tenantId, operation);
  }

  async onModuleDestroy() {
    await pool.end();
  }
}
