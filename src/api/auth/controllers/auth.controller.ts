import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { Environment } from "#api/environment/environment";
import { AuthService } from "../services/auth.service";
import { AuthContext } from "../interfaces/auth.interface";
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

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @Auth()
  async refresh(@Body("refreshToken") token: string) {
    if (!token) throw new BadRequestException();

    return await this.authService.refreshTokens(token);
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  @Auth()
  async logout(
    @Body("refreshToken") token: string,
    @CurrentUser() { id }: User
  ) {
    if (!token) throw new BadRequestException();

    await this.authService.logOut(id, token);
  }

  @Get("/callback")
  @UseGuards(AuthGuard("discord"))
  async callback(
    @CurrentUser() { id }: User,
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

    const redirectUrl = this.environment.clientUrl;
    res.redirect(
      redirectUrl + `?token=${authToken}&refreshToken=${refreshToken}`
    );
  }
}
