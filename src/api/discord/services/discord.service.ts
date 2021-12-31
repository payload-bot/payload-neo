import { Injectable, Logger } from "@nestjs/common";
import DiscordOauthService, { type PartialGuild } from "discord-oauth2";
import { Environment } from "#api/environment/environment";
import { container } from "@sapphire/framework";
import { ConvertedGuild } from "../dto/converted-guild.dto";
import { Guild, GuildMember, Permissions } from "discord.js";
import { Benchmark } from "#api/shared/perf-hook.decorator";

const { client } = container;

@Injectable()
export class DiscordService {
  // @ts-expect-error Logger is needed for debug since reflector :D
  private logger = new Logger(DiscordService.name);
  private handler: DiscordOauthService;

  constructor(
    readonly environment: Environment,
  ) {
    this.handler = new DiscordOauthService({
      clientId: environment.clientId,
      clientSecret: environment.clientSecret,
      credentials: Buffer.from(`${this.environment.clientId}:${this.environment.clientSecret}`).toString('base64')
    });
  }

  async revokeUserTokens(token: string) {
    await this.handler.revokeToken(token, );
  }

  @Benchmark
  async getSortedUserGuilds(
    id: string,
    accessToken: string,
    _refreshToken: string
  ) {
    const allGuilds = await this.handler.getUserGuilds(accessToken);

    const convertedGuilds = await this.convertGuilds(id, allGuilds);

    return convertedGuilds
      .filter((guild) => guild.canManage)
      .sort((a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1));
  }

  async canUserManageGuild(guild: Guild, member: GuildMember) {
    if (guild.ownerId === member.id) return true;
    if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return true;

    // @TODO: Allow for owners to add roles to allow dashboard access
    return false;
  }

  private async canManage(id: string, guild: PartialGuild) {
    if (guild.owner) return true;
    const fetchedGuild = await client.guilds.fetch(guild.id).catch(() => null);

    if (!fetchedGuild)
      return new Permissions(BigInt(guild.permissions!)).has(
        Permissions.FLAGS.MANAGE_GUILD
      );

    const member = await fetchedGuild.members.fetch(id).catch(() => null);
    if (!member) return false;

    return await this.canUserManageGuild(fetchedGuild, member);
  }

  @Benchmark
  private async convertGuilds(id: string, guilds: PartialGuild[]) {
    return await Promise.all(
      guilds.map(async (guild) => {
        const isPayloadIn = await client.guilds
          .fetch(guild.id)
          .catch(() => false);

        const icon =
          guild.icon &&
          `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;

        return new ConvertedGuild({
          isPayloadIn: isPayloadIn ? true : false,
          canManage: await this.canManage(id, guild),
          ...(guild as any),
          icon,
        });
      })
    );
  }
}
