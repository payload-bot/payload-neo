import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.modules";
import { Environment } from "./environment/environment";

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("/api");

  app.enableVersioning({
    prefix: "v",
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  const env = app.get(Environment);

  app.enableCors({
    origin: env.clientUrl,
  });

  await app.listen(8080);
}
