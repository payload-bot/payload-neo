import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CheckServerGuard } from "./check-server.guard";

export function GuildAuth() {
  return applyDecorators(
      UseGuards(AuthGuard("jwt"), 
      CheckServerGuard
    )
  );
}
