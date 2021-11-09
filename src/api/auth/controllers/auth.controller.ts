import {
  Controller,
  Get,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { Environment } from "#api/environment/environment";
import { AuthService } from "../services/auth.service";
import { AuthContext } from "../interfaces/auth.interface";
import { CurrentUser } from "../decorators/current-user.decorator";

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
    @CurrentUser() { id }: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const authToken = await this.authService.generateJwtToken(
      AuthContext.AUTH,
      id
    );

    const refreshToken = await this.authService.generateJwtToken(
      AuthContext.REFRESH,
      id
    );

    // @ts-ignore
    const redirectUrl = this.environment.clientUrl;
    res.redirect(
      "/api/v1/users" + `?token=${authToken}&refreshToken=${refreshToken}`
    );
  }
}
