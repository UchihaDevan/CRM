import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { DealsService } from './deals.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { DealStatus } from '@crm/shared';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

const trackingSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  ttclid: z.string().optional(),
  conversionUrl: z.string().optional(),
  userIp: z.string().optional(),
  userAgent: z.string().optional(),
  clickCapturedAt: z.coerce.date().optional(),
});

const createDealSchema = z.object({
  contactId: z.string().uuid(),
  stageId: z.string().uuid(),
  title: z.string().min(1).max(255),
  valueCents: z.number().int().min(0).optional(),
  customFields: z.record(z.unknown()).optional(),
  tracking: trackingSchema.optional(),
});

const updateStageSchema = z.object({
  stageId: z.string().uuid(),
});

const updateStatusSchema = z.object({
  status: z.enum([DealStatus.OPEN, DealStatus.WON, DealStatus.LOST]),
});

@Controller('deals')
@UseGuards(AuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('kanban')
  async getKanbanBoard(@Query('pipelineId') pipelineId: string) {
    if (!pipelineId) throw new Error('pipelineId é obrigatório');
    return this.dealsService.getKanbanBoard(pipelineId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createDealSchema))
  async createDeal(@Body() body: z.infer<typeof createDealSchema>) {
    return this.dealsService.createDeal(body);
  }

  @Put(':id/stage')
  @UsePipes(new ZodValidationPipe(updateStageSchema))
  async updateStage(@Param('id') id: string, @Body() body: z.infer<typeof updateStageSchema>) {
    return this.dealsService.updateStage(id, body.stageId);
  }

  @Put(':id/status')
  @UsePipes(new ZodValidationPipe(updateStatusSchema))
  async updateStatus(@Param('id') id: string, @Body() body: z.infer<typeof updateStatusSchema>) {
    return this.dealsService.updateStatus(id, body.status);
  }
}
