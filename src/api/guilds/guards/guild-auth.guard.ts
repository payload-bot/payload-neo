import { AuthenticationGuard } from "#api/auth/guards/is-authenticated.guard";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { CheckServerGuard } from "./check-server.guard";

export function GuildAuth() {
  return applyDecorators(UseGuards(AuthenticationGuard, CheckServerGuard));
}
