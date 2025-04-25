/* eslint-disable prettier/prettier */
// src/main.ts or wherever your app boots up
/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*', // ⚠️ for development: allow all origins
      credentials: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(config.GENERAL.port);
}
bootstrap();

