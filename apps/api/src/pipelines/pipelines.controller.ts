import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PipelinesService } from './pipelines.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('pipelines')
@UseGuards(AuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  async list() {
    return this.pipelinesService.listWithStages();
  }

  @Post()
  async createPipeline(@Body() body: { name: string; isDefault?: boolean }) {
    return this.pipelinesService.createPipeline(body.name, body.isDefault);
  }

  @Post(':id/stages')
  async addStage(
    @Param('id') pipelineId: string,
    @Body() body: { name: string; orderIndex: number },
  ) {
    return this.pipelinesService.addStage(pipelineId, body.name, body.orderIndex);
  }
}
