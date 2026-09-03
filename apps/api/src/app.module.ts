import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { PipelinesModule } from './pipelines/pipelines.module.js';
import { DealsModule } from './deals/deals.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ContactsModule,
    PipelinesModule,
    DealsModule,
  ],
})
export class AppModule {}
