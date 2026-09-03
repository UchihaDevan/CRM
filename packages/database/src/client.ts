import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/schema.js';
import { sql } from 'drizzle-orm';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm_db',
  max: 20,
});

export const db = drizzle(pool, { schema });

/**
 * Executa uma transação injetando o tenant_id no escopo da conexão.
 * Garante aplicação rígida de RLS tanto no fluxo HTTP quanto em Workers BullMQ.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    return await callback(tx as unknown as typeof db);
  });
}
