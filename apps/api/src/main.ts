import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { tenantStorage } from './common/tenant/tenant-context.js';
import cors from '@fastify/cors';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();

  // Hook nativo do Fastify para inicializar o escopo do AsyncLocalStorage por request
  fastifyAdapter.getInstance().addHook('onRequest', (req, _reply, done) => {
    const tenantIdHeader = req.headers['x-tenant-id'];
    const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;

    // SEMPRE envolver em run() para que o AuthGuard possa apenas mutar o store existente.
    tenantStorage.run({ tenantId: tenantId || '' }, () => done());
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  await app.register(cors as any, {
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3333;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API rodando em: http://localhost:${port}`);
}

bootstrap();
