import type { User } from "#api/users/models/user.model";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { container } from "@sapphire/framework";
import { GuildsService } from "../services/guilds.service";

const { client } = container;

@Injectable()
export class CheckServerGuard implements CanActivate {
  constructor(private guildsService: GuildsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const guildId = request.params.guildId;
    const user = request.user as User;

    const userServers = await this.guildsService.getUserGuilds(user.id);

    if (!userServers.find(s => s.id === guildId)) {
      return false;
    }

    if (!(await client.guilds.fetch(guildId))) {
      throw new InternalServerErrorException({
        message: "Could not fetch guild from Discord",
      });
    }

    return true;
  }
}
