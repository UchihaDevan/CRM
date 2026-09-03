export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  AGENT: 'AGENT',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const DealStatus = {
  OPEN: 'OPEN',
  WON: 'WON',
  LOST: 'LOST',
} as const;
export type DealStatus = (typeof DealStatus)[keyof typeof DealStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELED: 'CANCELED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const NicheTemplate = {
  RETAIL_DELIVERY: 'RETAIL_DELIVERY', // B2C / Recorrência curta (açaiteria, cachaçaria, delivery)
  CONSULTATIVE_SALES: 'CONSULTATIVE_SALES', // B2B / Serviços consultivos
  DISTRIBUTION: 'DISTRIBUTION', // B2B Atacado / Distribuição (produtos de limpeza)
  GENERIC: 'GENERIC',
} as const;
export type NicheTemplate = (typeof NicheTemplate)[keyof typeof NicheTemplate];
