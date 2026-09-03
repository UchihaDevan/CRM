import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { contacts } from '@crm/database';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { TenantContext } from '../common/tenant/tenant-context.js';

@Injectable()
export class ContactsService {
  constructor(private readonly dbService: DatabaseService) {}

  async list(search?: string) {
    return this.dbService.withTenant(async (tx) => {
      if (search) {
        return tx
          .select()
          .from(contacts)
          .where(
            or(
              ilike(contacts.name, `%${search}%`),
              ilike(contacts.email, `%${search}%`),
              ilike(contacts.phoneE164, `%${search}%`),
              ilike(contacts.document, `%${search}%`),
            ),
          )
          .orderBy(desc(contacts.createdAt));
      }
      return tx.select().from(contacts).orderBy(desc(contacts.createdAt));
    });
  }

  async findById(id: string) {
    return this.dbService.withTenant(async (tx) => {
      const [contact] = await tx
        .select()
        .from(contacts)
        .where(eq(contacts.id, id))
        .limit(1);

      if (!contact) {
        throw new NotFoundException('Contato não encontrado.');
      }
      return contact;
    });
  }

  async create(data: {
    name: string;
    phoneE164?: string;
    email?: string;
    document?: string;
    customFields?: Record<string, unknown>;
  }) {
    const tenantId = TenantContext.getTenantId();

    return this.dbService.withTenant(async (tx) => {
      const [newContact] = await tx
        .insert(contacts)
        .values({
          tenantId,
          name: data.name,
          phoneE164: data.phoneE164,
          email: data.email,
          document: data.document,
          customFields: data.customFields || {},
        })
        .returning();
      return newContact;
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      phoneE164?: string;
      email?: string;
      document?: string;
      customFields?: Record<string, unknown>;
      lastInboundInteractionAt?: Date;
    },
  ) {
    return this.dbService.withTenant(async (tx) => {
      const [updatedContact] = await tx
        .update(contacts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, id))
        .returning();

      if (!updatedContact) {
        throw new NotFoundException('Contato não encontrado.');
      }
      return updatedContact;
    });
  }
}
