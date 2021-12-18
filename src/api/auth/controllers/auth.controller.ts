import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { Environment } from "#api/environment/environment";
import { AuthService } from "../services/auth.service";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Auth } from "../guards/auth.guard";
import type { User } from "#api/users/models/user.model";

@Controller({
  path: "auth",
  version: VERSION_NEUTRAL,
})
export class AuthController {
  constructor(
    private environment: Environment,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(AuthGuard("discord"))
  login() {}

  @Get("/callback")
  @UseGuards(AuthGuard("discord"))
  async callback(
    @CurrentUser() { id }: User,
    @Res({ passthrough: true }) res: Response
  ) {}

  @Post("/logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async logout(@CurrentUser() { id, accessToken }: User) {}
}
