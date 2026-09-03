import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { deals, dealTracking, pipelineStages, contacts } from '@crm/database';
import { eq, desc, asc } from 'drizzle-orm';
import { DealStatus, TrackingParams } from '@crm/shared';
import { TenantContext } from '../common/tenant/tenant-context.js';

@Injectable()
export class DealsService {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Retorna os deals organizados por colunas de estágio para o Kanban
   */
  async getKanbanBoard(pipelineId: string) {
    return this.dbService.withTenant(async (tx) => {
      // 1. Buscar estágios do funil
      const stages = await tx
        .select()
        .from(pipelineStages)
        .where(eq(pipelineStages.pipelineId, pipelineId))
        .orderBy(asc(pipelineStages.orderIndex));

      // 2. Buscar todos os deals vinculados aos estágios com dados do contato e tracking
      const allDeals = await tx
        .select({
          deal: deals,
          contact: {
            id: contacts.id,
            name: contacts.name,
            phoneE164: contacts.phoneE164,
            email: contacts.email,
          },
          tracking: dealTracking,
        })
        .from(deals)
        .innerJoin(contacts, eq(deals.contactId, contacts.id))
        .leftJoin(dealTracking, eq(deals.id, dealTracking.dealId))
        .orderBy(desc(deals.createdAt));

      // 3. Agrupar por coluna/estágio
      const board = stages.map((stage) => {
        const stageDeals = allDeals.filter((d) => d.deal.stageId === stage.id);
        const totalValueCents = stageDeals.reduce((sum, d) => sum + d.deal.valueCents, 0);

        return {
          stage,
          deals: stageDeals,
          totalDeals: stageDeals.length,
          totalValueCents,
        };
      });

      return board;
    });
  }

  async createDeal(data: {
    contactId: string;
    stageId: string;
    title: string;
    valueCents?: number;
    customFields?: Record<string, unknown>;
    tracking?: TrackingParams;
  }) {
    const tenantId = TenantContext.getTenantId();

    return this.dbService.withTenant(async (tx) => {
      // 1. Criar o deal
      const [newDeal] = await tx
        .insert(deals)
        .values({
          tenantId,
          contactId: data.contactId,
          stageId: data.stageId,
          title: data.title,
          valueCents: data.valueCents || 0,
          status: DealStatus.OPEN,
          customFields: data.customFields || {},
        })
        .returning();

      // 2. Gravar tracking se fornecido
      if (data.tracking) {
        await tx.insert(dealTracking).values({
          tenantId,
          dealId: newDeal.id,
          utmSource: data.tracking.utmSource,
          utmMedium: data.tracking.utmMedium,
          utmCampaign: data.tracking.utmCampaign,
          utmTerm: data.tracking.utmTerm,
          utmContent: data.tracking.utmContent,
          gclid: data.tracking.gclid,
          fbclid: data.tracking.fbclid,
          ttclid: data.tracking.ttclid,
          conversionUrl: data.tracking.conversionUrl,
          userIp: data.tracking.userIp,
          userAgent: data.tracking.userAgent,
          clickCapturedAt: data.tracking.clickCapturedAt || new Date(),
        });
      }

      return newDeal;
    });
  }

  async updateStage(dealId: string, stageId: string) {
    return this.dbService.withTenant(async (tx) => {
      const [updatedDeal] = await tx
        .update(deals)
        .set({
          stageId,
          updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId))
        .returning();

      if (!updatedDeal) {
        throw new NotFoundException('Oportunidade não encontrada.');
      }
      return updatedDeal;
    });
  }

  async updateStatus(dealId: string, status: DealStatus) {
    return this.dbService.withTenant(async (tx) => {
      const isClosed = status === DealStatus.WON || status === DealStatus.LOST;

      const [updatedDeal] = await tx
        .update(deals)
        .set({
          status,
          closedAt: isClosed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId))
        .returning();

      if (!updatedDeal) {
        throw new NotFoundException('Oportunidade não encontrada.');
      }
      return updatedDeal;
    });
  }
}
