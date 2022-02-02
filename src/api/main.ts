import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.modules";
import { Environment } from "./environment/environment";
import { DocumentNotFoundFilter } from "./shared/document-not-found.filter";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Time } from "@sapphire/time-utilities";
import { SessionStorageFactory } from "./auth/factories/session-storage.factory";

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("/api");

  app.enableVersioning({
    prefix: "v",
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  const env = app.get(Environment);

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      store: await new SessionStorageFactory(env).register(),
      name: "__session",
      secret: Array.isArray(env.sessionSecret)
        ? env.sessionSecret
        : [env.sessionSecret],
      cookie: {
        domain: env.cookieDomain,
        sameSite: "lax",
        httpOnly: true,
        secure: env.nodeEnv === "production",
        maxAge: Time.Month,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(
    cookieParser(
      Array.isArray(env.cookieSecret) ? env.cookieSecret : [env.cookieSecret]
    )
  );

  app.enableCors({
    origin: env.clientUrl,
  });

  app.useGlobalFilters(new DocumentNotFoundFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  await app.listen(8080);
}
