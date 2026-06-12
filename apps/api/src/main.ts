import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import express, { type Request, type Response, json, urlencoded } from 'express';
import { AppModule } from './app.module';

const server = express();

async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins = (process.env.WEB_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      const ok =
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https:\/\/glucia-web[a-z0-9-]*\.vercel\.app$/.test(origin);
      cb(null, ok);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mahsa API')
      .setDescription('مهسا — پلتفرم هوشمند مدیریت دیابت')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, doc);
  }

  return app;
}

// Vercel serverless: bootstrap once per lambda instance, reuse across invocations
let appReady: Promise<unknown> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!appReady) appReady = createApp().then((app) => app.init());
  await appReady;
  server(req, res);
}

// Local / Docker: long-running server
if (!process.env.VERCEL) {
  createApp().then(async (app) => {
    const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
    await app.listen(port);
    Logger.log(`🚀 Glucia API → http://localhost:${port}/api/v1`, 'Bootstrap');
    if (process.env.NODE_ENV !== 'production') {
      Logger.log(`📚 Swagger  → http://localhost:${port}/api/docs`, 'Bootstrap');
    }
  });
}
