import { Module } from "@nestjs/common";
// @ts-expect-error
import { Connection } from "mongoose";
import { MigrationsService } from "./services/migrations.service";

@Module({
  providers: [MigrationsService],
})
export class MigrationsModule {}
