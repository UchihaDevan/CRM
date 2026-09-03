import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { users, tenants, tenantUsers } from '@crm/database';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { UserRole, NicheTemplate } from '@crm/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async registerTenant(data: {
    tenantName: string;
    slug: string;
    nicheTemplate?: NicheTemplate;
    userName: string;
    email: string;
    password: string;
  }) {
    // 1. Validar se usuário ou slug já existem
    const existingUser = await this.dbService.rawDb
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const existingSlug = await this.dbService.rawDb
      .select()
      .from(tenants)
      .where(eq(tenants.slug, data.slug))
      .limit(1);

    if (existingSlug.length > 0) {
      throw new ConflictException('Slug de organização já em uso.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 2. Criar Tenant, Usuário e Vincular como OWNER
    const result = await this.dbService.rawDb.transaction(async (tx) => {
      const [newTenant] = await tx
        .insert(tenants)
        .values({
          name: data.tenantName,
          slug: data.slug,
          nicheTemplate: data.nicheTemplate || 'GENERIC',
        })
        .returning();

      const [newUser] = await tx
        .insert(users)
        .values({
          name: data.userName,
          email: data.email,
          passwordHash,
        })
        .returning();

      await tx.insert(tenantUsers).values({
        tenantId: newTenant.id,
        userId: newUser.id,
        role: UserRole.OWNER,
      });

      return { tenant: newTenant, user: newUser };
    });

    const token = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
      role: UserRole.OWNER,
    });

    return {
      accessToken: token,
      tenant: result.tenant,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: UserRole.OWNER,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const [user] = await this.dbService.rawDb
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // Buscar tenant vinculado
    const [membership] = await this.dbService.rawDb
      .select()
      .from(tenantUsers)
      .where(eq(tenantUsers.userId, user.id))
      .limit(1);

    if (!membership) {
      throw new UnauthorizedException('Usuário não pertence a nenhuma organização.');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      role: membership.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: membership.tenantId,
        role: membership.role,
      },
    };
  }
}
