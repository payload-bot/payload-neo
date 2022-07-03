import { EntityRepository } from "#lib/api/repository/EntityRepository";
import type { User } from "@prisma/client";

export class UserRepository extends EntityRepository<User> {
  public override async postGet(obj: User) {
    if (this.identity?.id !== obj?.id) {
      throw this.response.notFound();
    }
  }
}
