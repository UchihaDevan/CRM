import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { NicheTemplate } from '@crm/shared';

const registerSchema = z.object({
  tenantName: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nicheTemplate: z.enum([NicheTemplate.RETAIL_DELIVERY, NicheTemplate.CONSULTATIVE_SALES, NicheTemplate.DISTRIBUTION, NicheTemplate.GENERIC]).optional(),
  userName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: z.infer<typeof registerSchema>) {
    return this.authService.registerTenant(body);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: z.infer<typeof loginSchema>) {
    return this.authService.login(body);
  }
}
