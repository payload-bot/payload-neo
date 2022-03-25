import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import DiscordOauthService, { type PartialGuild } from "discord-oauth2";
import { Environment } from "#api/environment/environment";
import { container } from "@sapphire/framework";
import { ConvertedGuild } from "../dto/converted-guild.dto";
import { Guild, GuildMember, Permissions } from "discord.js";
import { Benchmark } from "#api/shared/perf-hook.decorator";
// @ts-expect-error
import { Cache } from "cache-manager";

const { client } = container;

@Injectable()
export class DiscordService {
  private logger = new Logger(DiscordService.name);
  private handler: DiscordOauthService;

  constructor(
    @Inject(CACHE_MANAGER)
    private cache: Cache,
    readonly environment: Environment
  ) {
    this.handler = new DiscordOauthService({
      version: "v9",
      clientId: environment.clientId,
      clientSecret: environment.clientSecret,
      credentials: Buffer.from(
        `${this.environment.clientId}:${this.environment.clientSecret}`
      ).toString("base64"),
    });

    this.handler.on("debug", this.logger.debug);
    this.handler.on("warn", this.logger.warn);
  }

  async revokeUserTokens(token: string) {
    await this.handler.revokeToken(token);
  }

  @Benchmark
  async getSortedUserGuilds(
    id: string,
    accessToken: string,
    _refreshToken: string
  ) {
    return (
      (await this.cache.get<ConvertedGuild[]>(id + ":allguilds")) ??
      (await this.fetchUserGuildsAndCache(id, accessToken))
    );
  }

  async deleteCachedGuilds(id: string) {
    await this.cache.del(id + ":allguilds");
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

  private async fetchUserGuildsAndCache(id: string, accessToken: string) {
    // FIXME: This is stupid. Catch oauth errors + refresh before throwing
    const allGuilds = await this.handler.getUserGuilds(accessToken);

    const convertedGuilds = await this.convertGuilds(id, allGuilds);

    const sortedAndFiltered = convertedGuilds
      .filter((guild) => guild.canManage)
      .sort((a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1));

    await this.cache.set(id + ":allguilds", sortedAndFiltered, { ttl: 600 });

    return sortedAndFiltered;
  }
}
