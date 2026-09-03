import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { pipelines, pipelineStages } from '@crm/database';
import { eq, asc } from 'drizzle-orm';
import { TenantContext } from '../common/tenant/tenant-context.js';

@Injectable()
export class PipelinesService {
  constructor(private readonly dbService: DatabaseService) {}

  async listWithStages() {
    return this.dbService.withTenant(async (tx) => {
      const allPipelines = await tx
        .select()
        .from(pipelines)
        .orderBy(asc(pipelines.orderIndex));

      const allStages = await tx
        .select()
        .from(pipelineStages)
        .orderBy(asc(pipelineStages.orderIndex));

      return allPipelines.map((pipeline) => ({
        ...pipeline,
        stages: allStages.filter((stage) => stage.pipelineId === pipeline.id),
      }));
    });
  }

  async createPipeline(name: string, isDefault = false) {
    const tenantId = TenantContext.getTenantId();

    return this.dbService.withTenant(async (tx) => {
      const [newPipeline] = await tx
        .insert(pipelines)
        .values({
          tenantId,
          name,
          isDefault,
        })
        .returning();

      // Criar estágios padrão para o novo funil
      const defaultStages = ['Novo Lead', 'Qualificação / Atendimento', 'Proposta / Pedido', 'Fechamento'];
      const stages = await Promise.all(
        defaultStages.map((stageName, idx) =>
          tx
            .insert(pipelineStages)
            .values({
              tenantId,
              pipelineId: newPipeline.id,
              name: stageName,
              orderIndex: idx,
            })
            .returning(),
        ),
      );

      return {
        ...newPipeline,
        stages: stages.map(([s]) => s),
      };
    });
  }

  async addStage(pipelineId: string, name: string, orderIndex: number) {
    const tenantId = TenantContext.getTenantId();

    return this.dbService.withTenant(async (tx) => {
      const [newStage] = await tx
        .insert(pipelineStages)
        .values({
          tenantId,
          pipelineId,
          name,
          orderIndex,
        })
        .returning();
      return newStage;
    });
  }
}
