import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, UsePipes } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

const createContactSchema = z.object({
  name: z.string().min(1).max(255),
  phoneE164: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  document: z.string().max(32).optional(),
  customFields: z.record(z.unknown()).optional(),
});

const updateContactSchema = createContactSchema.partial();

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
  @UsePipes(new ZodValidationPipe(createContactSchema))
  async create(@Body() body: z.infer<typeof createContactSchema>) {
    const validBody = { ...body, email: body.email === '' ? undefined : body.email };
    return this.contactsService.create(validBody);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateContactSchema))
  async update(@Param('id') id: string, @Body() body: z.infer<typeof updateContactSchema>) {
    const validBody = { ...body, email: body.email === '' ? undefined : body.email };
    return this.contactsService.update(id, validBody);
  }
}
