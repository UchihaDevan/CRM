import { Module } from '@nestjs/common';
import { PipelinesService } from './pipelines.service.js';
import { PipelinesController } from './pipelines.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PipelinesController],
  providers: [PipelinesService],
  exports: [PipelinesService],
})
export class PipelinesModule {}
