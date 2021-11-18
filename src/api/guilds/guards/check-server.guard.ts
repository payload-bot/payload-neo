import type { User } from "#api/users/models/user.model";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { GuildsService } from "../services/guilds.service";

@Injectable()
export class CheckServerGuard implements CanActivate {
  constructor(private guildsService: GuildsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const guildId = request.params.guildId;
    const user = request.user as User;

    const canManage = await this.guildsService.getUserGuildsManagable(
      user.id,
      guildId
    );

    return canManage;
  }
}
