import { EntityRepository } from "#api/repository/EntityRepository";
import type { User } from "#lib/models/User";

export class UserRepository extends EntityRepository<typeof User> {
  public model = "User";

  public override async postGet(obj: any) {
    this.logger.info(this.identity);
    this.logger.info(obj);
  }

  public override async postPatch(obj: any, _obj2: any) {
    this.logger.info(obj);
  }

  public override async postDelete(obj: any) {
    this.logger.info(obj);
  }
}
