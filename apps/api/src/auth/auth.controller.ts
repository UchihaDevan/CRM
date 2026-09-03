import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { NicheTemplate } from '@crm/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      tenantName: string;
      slug: string;
      nicheTemplate?: NicheTemplate;
      userName: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.registerTenant(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}
