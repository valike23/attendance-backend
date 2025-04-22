/* eslint-disable prettier/prettier */
// src/main.ts or wherever your app boots up
import 'reflect-metadata';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.GENERAL.port);
}
bootstrap();
