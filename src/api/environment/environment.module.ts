import { Module } from "@nestjs/common";
import { Environment } from "./environment";

@Module({
  providers: [Environment],
})
export class EnvironmentModule {}
