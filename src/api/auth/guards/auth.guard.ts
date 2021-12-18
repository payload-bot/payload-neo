import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthenticationGuard } from "./is-authenticated.guard";

export function Auth() {
  return applyDecorators(UseGuards(AuthenticationGuard));
}
