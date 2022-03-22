import { Module } from "@nestjs/common";
import { MigrationsService } from "./services/migrations.service";

@Module({
  providers: [MigrationsService],
})
export class MigrationsModule {}
