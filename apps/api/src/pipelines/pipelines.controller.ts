import { Controller, Get, Post, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { PipelinesService } from './pipelines.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

const createPipelineSchema = z.object({
  name: z.string().min(1).max(100),
  isDefault: z.boolean().optional(),
});

const addStageSchema = z.object({
  name: z.string().min(1).max(100),
  orderIndex: z.number().int().min(0),
});

@Controller('pipelines')
@UseGuards(AuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  async list() {
    return this.pipelinesService.listWithStages();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createPipelineSchema))
  async createPipeline(@Body() body: z.infer<typeof createPipelineSchema>) {
    return this.pipelinesService.createPipeline(body.name, body.isDefault);
  }

  @Post(':id/stages')
  @UsePipes(new ZodValidationPipe(addStageSchema))
  async addStage(
    @Param('id') pipelineId: string,
    @Body() body: z.infer<typeof addStageSchema>,
  ) {
    return this.pipelinesService.addStage(pipelineId, body.name, body.orderIndex);
  }
}
