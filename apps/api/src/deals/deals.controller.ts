import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DealsService } from './deals.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { DealStatus, TrackingParams } from '@crm/shared';

@Controller('deals')
@UseGuards(AuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('kanban')
  async getKanbanBoard(@Query('pipelineId') pipelineId: string) {
    return this.dealsService.getKanbanBoard(pipelineId);
  }

  @Post()
  async createDeal(
    @Body()
    body: {
      contactId: string;
      stageId: string;
      title: string;
      valueCents?: number;
      customFields?: Record<string, unknown>;
      tracking?: TrackingParams;
    },
  ) {
    return this.dealsService.createDeal(body);
  }

  @Put(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body('stageId') stageId: string,
  ) {
    return this.dealsService.updateStage(id, stageId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DealStatus,
  ) {
    return this.dealsService.updateStatus(id, status);
  }
}
