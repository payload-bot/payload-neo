import { PassportSerializer } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import type { User } from "#api/users/models/user.model";
import { UserService } from "#api/users/services/user.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }

  async serializeUser(user: User, done: any) {
    done(null, user.id);
  }

  async deserializeUser(payload: string, done: any) {
    const serializedUser = await this.userService.userToProfile(payload);

    done(null, serializedUser);
  }
}
