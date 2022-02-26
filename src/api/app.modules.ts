import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { Environment } from "./environment/environment";
import { EnvironmentModule } from "./environment/environment.module";
import { GuildsModule } from "./guilds/guilds.module";
import { UsersModule } from "./users/users.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { MigrationsModule } from "./migrations/migrations.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
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
