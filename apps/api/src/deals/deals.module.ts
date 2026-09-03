import { Module } from '@nestjs/common';
import { DealsService } from './deals.service.js';
import { DealsController } from './deals.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
