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
  );
  app.setGlobalPrefix('api');
  app.set('trust proxy', true);
  app.enableCors();
  await app.init();
  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!server) server = await bootstrap();
  return server(req, res);
}
