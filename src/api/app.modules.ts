import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { Environment } from "./environment/environment";
import { EnvironmentModule } from "./environment/environment.module";
import { UsersModule } from "./users/users.module";

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
  ],
})
export class AppModule {}
