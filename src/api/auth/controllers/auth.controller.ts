import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import type { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get("/login")
  @UseGuards(AuthGuard("discord"))
  async login() {}

  @Get("/callback")
  @UseGuards(AuthGuard("discord"))
  async callback(@Res({ passthrough: true }) res: Response) {
    const redirectUrl = this.configService.get<string>("CLIENT_URL");
    res.redirect(redirectUrl + `?token=`);
  }
}
