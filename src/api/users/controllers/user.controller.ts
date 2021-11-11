import { CurrentUser } from "#api/auth/decorators/current-user.decorator";
import { Auth } from "#api/auth/guards/auth.guard";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseInterceptors,
} from "@nestjs/common";
import { UpdateProfileDto } from "../dto/update-profile.dto";
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

  @Patch()
  @Auth()
  async updateUser(
    @CurrentUser() { id }: User,
    @Body() body: UpdateProfileDto
  ) {
    return await this.userService.updateUserProfile(id, body);
  }
}
