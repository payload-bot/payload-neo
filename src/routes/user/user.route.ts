import {
  EntityController,
  EntityControllerOptions,
} from "#api/EntityController";
import { ApplyOptions } from "@sapphire/decorators";
import type { User } from "#lib/models/User";

@ApplyOptions<EntityControllerOptions>({ route: "/users/:id", model: "User" })
export class UserRoute extends EntityController<typeof User> {}
