import { CurrentUser } from "#api/auth/decorators/current-user.decorator";
import { Auth } from "#api/auth/guards/auth.guard";
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from "@nestjs/common";
import type { User } from "../models/user.model";
import { UserService } from "../services/user.service";

@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Auth()
  async currentUser(@CurrentUser() { id }: User) {
    return await this.userService.userToProfile(id);
  }
}
