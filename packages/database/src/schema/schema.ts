import { 
  pgTable, uuid, text, timestamp, integer, varchar, jsonb, index, uniqueIndex, boolean 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { UserRole, DealStatus, OrderStatus, NicheTemplate } from '@crm/shared';

// 1. Organizações / Clientes da Plataforma (Tenants)
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nicheTemplate: varchar('niche_template', { length: 50 }).$type<NicheTemplate>().notNull().default('GENERIC'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Usuários & Permissões (RBAC)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tenantUsers = pgTable('tenant_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).$type<UserRole>().notNull().default('AGENT'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('tenant_user_unique_idx').on(t.tenantId, t.userId),
  index('tenant_users_tenant_idx').on(t.tenantId),
]);

// 3. Contatos (Base Permanente de Pessoas e Clientes)
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phoneE164: varchar('phone_e164', { length: 20 }),
  email: varchar('email', { length: 255 }),
  document: varchar('document', { length: 32 }),
  lastInboundInteractionAt: timestamp('last_inbound_interaction_at', { withTimezone: true }),
  customFields: jsonb('custom_fields').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('contacts_tenant_phone_idx').on(t.tenantId, t.phoneE164),
  index('contacts_tenant_email_idx').on(t.tenantId, t.email),
  index('contacts_tenant_document_idx').on(t.tenantId, t.document),
]);

// 4. Pipelines & Estágios
export const pipelines = pgTable('pipelines', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('pipelines_tenant_idx').on(t.tenantId),
]);

export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('pipeline_stages_pipeline_idx').on(t.tenantId, t.pipelineId),
]);

// 5. Oportunidades Transacionais (Deals)
export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  stageId: uuid('stage_id').notNull().references(() => pipelineStages.id),
  title: varchar('title', { length: 255 }).notNull(),
  valueCents: integer('value_cents').notNull().default(0),
  status: varchar('status', { length: 20 }).$type<DealStatus>().notNull().default('OPEN'),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  customFields: jsonb('custom_fields').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('deals_tenant_stage_idx').on(t.tenantId, t.stageId),
  index('deals_tenant_status_idx').on(t.tenantId, t.status),
  index('deals_tenant_contact_idx').on(t.tenantId, t.contactId),
]);

// 6. Rastreamento e Atribuição da Oportunidade
export const dealTracking = pgTable('deal_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }).unique(),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 150 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  utmContent: varchar('utm_content', { length: 150 }),
  gclid: text('gclid'),
  fbclid: text('fbclid'),
  ttclid: text('ttclid'),
  conversionUrl: text('conversion_url'),
  userIp: varchar('user_ip', { length: 45 }),
  userAgent: text('user_agent'),
  clickCapturedAt: timestamp('click_captured_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('deal_tracking_tenant_idx').on(t.tenantId),
]);

// 7. Catálogo & Transações Financeiras (Orders)
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  priceCents: integer('price_cents').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('products_tenant_idx').on(t.tenantId),
]);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  dealId: uuid('deal_id').references(() => deals.id),
  status: varchar('status', { length: 30 }).$type<OrderStatus>().notNull().default('PENDING'),
  totalAmountCents: integer('total_amount_cents').notNull(),
  externalReference: varchar('external_reference', { length: 255 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('orders_tenant_contact_idx').on(t.tenantId, t.contactId),
  index('orders_tenant_status_idx').on(t.tenantId, t.status),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  unitPriceCents: integer('unit_price_cents').notNull(),
  totalPriceCents: integer('total_price_cents').notNull(),
}, (t) => [
  index('order_items_tenant_order_idx').on(t.tenantId, t.orderId),
]);

// Relacionamentos Drizzle
export const tenantsRelations = relations(tenants, ({ many }) => ({
  tenantUsers: many(tenantUsers),
  contacts: many(contacts),
  pipelines: many(pipelines),
  deals: many(deals),
  products: many(products),
  orders: many(orders),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  tenant: one(tenants, { fields: [contacts.tenantId], references: [tenants.id] }),
  deals: many(deals),
  orders: many(orders),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  tenant: one(tenants, { fields: [deals.tenantId], references: [tenants.id] }),
  contact: one(contacts, { fields: [deals.contactId], references: [contacts.id] }),
  stage: one(pipelineStages, { fields: [deals.stageId], references: [pipelineStages.id] }),
  tracking: one(dealTracking, { fields: [deals.id], references: [dealTracking.dealId] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tenant: one(tenants, { fields: [orders.tenantId], references: [tenants.id] }),
  contact: one(contacts, { fields: [orders.contactId], references: [contacts.id] }),
  deal: one(deals, { fields: [orders.dealId], references: [deals.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
