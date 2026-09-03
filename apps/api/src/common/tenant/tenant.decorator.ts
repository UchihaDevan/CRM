import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from './tenant-context.js';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => TenantContext.getTenantId()
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => TenantContext.getUserId()
);
