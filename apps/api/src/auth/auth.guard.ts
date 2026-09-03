import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { tenantStorage } from '../common/tenant/tenant-context.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fallback para header x-tenant-id se presente (ex: chamadas de tracking/postback)
      const tenantIdHeader = request.headers['x-tenant-id'];
      if (tenantIdHeader) {
        const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;
        const store = tenantStorage.getStore();
        if (store) store.tenantId = tenantId;
        return true;
      }
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const store = tenantStorage.getStore();
      if (store) {
        store.tenantId = payload.tenantId;
        store.userId = payload.sub;
        store.role = payload.role;
      }
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
