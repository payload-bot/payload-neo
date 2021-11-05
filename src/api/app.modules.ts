import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "./auth/auth.module";
import { Environment } from "./environment/environment";
import { EnvironmentModule } from "./environment/environment.module";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [Environment],
      useFactory: async (environment: Environment) => ({
        uri: environment.mongoDbUri,
      }),
    }),
    PassportModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
