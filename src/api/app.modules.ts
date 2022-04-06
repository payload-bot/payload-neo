import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { Environment } from "./environment/environment";
import { EnvironmentModule } from "./environment/environment.module";
import { GuildsModule } from "./guilds/guilds.module";
import { UsersModule } from "./users/users.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { MigrationsModule } from "./migrations/migrations.module";
import { CacheModule } from "./cache/cache.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register(),
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [Environment],
      useFactory: (environment: Environment) => ({
        uri: environment.mongoDbUri,
      }),
    }),
    EnvironmentModule,
    AuthModule,
    UsersModule,
    GuildsModule,
    WebhooksModule,
    MigrationsModule,
  ],
})
export class AppModule {}
