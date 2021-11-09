import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Environment } from "./environment";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [Environment],
  exports: [Environment],
})
export class EnvironmentModule {}
