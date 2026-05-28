import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './src/app.module';

let server: express.Application;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error'] },
  );
  app.setGlobalPrefix('api');
  app.set('trust proxy', true);
  app.enableCors();
  await app.init();
  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    if (!server) server = await bootstrap();
    server(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e instanceof Error ? e.message : 'Server error' });
  }
}
