import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(@Query('search') search?: string) {
    return this.contactsService.list(search);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.contactsService.findById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      phoneE164?: string;
      email?: string;
      document?: string;
      customFields?: Record<string, unknown>;
    },
  ) {
    return this.contactsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phoneE164?: string;
      email?: string;
      document?: string;
      customFields?: Record<string, unknown>;
    },
  ) {
    return this.contactsService.update(id, body);
  }
}
