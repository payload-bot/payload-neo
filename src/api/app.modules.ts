import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { Environment } from "./environment/environment";
import { EnvironmentModule } from "./environment/environment.module";
import { GuildsModule } from "./guilds/guilds.module";
import { UsersModule } from "./users/users.module";
import { HttpModule } from "@nestjs/axios";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({
      timeout: 5000,
    }),
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
  ],
})
export class AppModule {}
