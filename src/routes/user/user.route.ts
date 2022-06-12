import {
  EntityController,
  EntityControllerOptions,
} from "#api/EntityController";
import { ApplyOptions } from "@sapphire/decorators";
import type { User } from "#lib/models/User";
import { UserRepository } from "#api/users/user.repository";

@ApplyOptions<EntityControllerOptions>({ route: "users/:id", model: "User", repository: UserRepository })
export class UserRoute extends EntityController<typeof User> {}
