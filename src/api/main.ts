import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.modules";
import { Environment } from "./environment/environment";
import { DocumentNotFoundFilter } from "./shared/document-not-found.filter";

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

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

  app.useGlobalFilters(new DocumentNotFoundFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  await app.listen(8080, "0.0.0.0");
  console.log(`Application is running on: ${await app.getUrl()}`);
}
