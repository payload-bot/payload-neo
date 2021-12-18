import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Environment } from "#api/environment/environment";
import { Auth } from "../guards/auth.guard";
import { DiscordSessionGuard } from "../guards/session.guard";

@Controller({
  path: "auth",
  version: VERSION_NEUTRAL,
})
export class AuthController {
  // @ts-expect-error
  constructor(private environment: Environment) {}

  @Get()
  @UseGuards(DiscordSessionGuard)
  login() {}

  @Get("/callback")
  @UseGuards(DiscordSessionGuard)
  async callback(@Res({ passthrough: true }) res: Response) {
    res.redirect(`/api/v1/users`);
  }

  @Post("/logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async logout(@Req() req: Request) {
    await req.logout();
    return;
  }
}
