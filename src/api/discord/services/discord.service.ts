import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import DiscordOauthService, { type PartialGuild } from "discord-oauth2";
import { Environment } from "#api/environment/environment";
import { container } from "@sapphire/framework";
import { ConvertedGuild } from "../dto/converted-guild.dto";
import { Guild, GuildMember, Permissions } from "discord.js";
import type { GuildInfo } from "passport-discord";
import { CacheService } from "#api/cache/cache.service";
import { Time } from "@sapphire/time-utilities";
import { UserService } from "#api/users/services/user.service";

const { client } = container;

@Injectable()
export class DiscordService {
  private logger = new Logger(DiscordService.name);
  private handler: DiscordOauthService;

  constructor(
    private cache: CacheService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
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

    this.handler.on("debug", (...args) => this.logger.debug(...args));
    this.handler.on("warn", (...args) => this.logger.warn(...args));
  }

  async revokeUserTokens(token: string) {
    await this.handler.revokeToken(token);
  }

  async getSortedUserGuilds(
    id: string,
    accessToken: string,
    refreshToken: string
  ) {
    return (
      (await this.cache.get<ConvertedGuild[]>(id + ":allguilds")) ??
      (await this.fetchUserGuildsAndCache(id, accessToken, refreshToken))
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

  async cacheUserServers(id: string, guilds: GuildInfo[]) {
    const convertedGuilds = await this.convertGuilds(
      id,
      guilds as PartialGuild[]
    );

    const sortedAndFiltered = convertedGuilds
      .filter((guild) => guild.canManage)
      .sort((a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1));

    await this.cache.set(id + ":allguilds", sortedAndFiltered, Time.Day / 1000);
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

  private async convertGuilds(id: string, guilds: PartialGuild[]) {
    const converted: ConvertedGuild[] = [];

    for (const guild of guilds) {
      const isPayloadIn = await client.guilds
        .fetch(guild.id)
        .catch(() => false);

      const icon =
        guild.icon &&
        `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;

      converted.push(
        new ConvertedGuild({
          isPayloadIn: isPayloadIn ? true : false,
          canManage: await this.canManage(id, guild),
          ...(guild as any),
          icon,
        })
      );
    }

    return converted;
  }

  private async fetchUserGuildsAndCache(
    id: string,
    accessToken: string,
    refreshToken: string
  ) {
    this.logger.verbose("Fetching user guilds");
    const allGuilds = await this.getUserGuilds(id, accessToken, refreshToken);

    const convertedGuilds = await this.convertGuilds(id, allGuilds);

    const sortedAndFiltered = convertedGuilds
      .filter((guild) => guild.canManage)
      .sort((a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1));

    await this.cache.set(id + ":allguilds", sortedAndFiltered, Time.Day / 1000);

    return sortedAndFiltered;
  }

  private async getUserGuilds(
    id: string,
    accessToken: string,
    refreshToken: string
  ) {
    const guilds = await this.handler
      .getUserGuilds(accessToken)
      .catch(() => null);

    // Going to re-auth then re-fetch
    if (!guilds) {
      const { access_token, refresh_token } = await this.handler.tokenRequest({
        grantType: "refresh_token",
        // :rolling_eyes:
        scope: [],
        refreshToken,
      });

      await this.userService.updateUser(id, {
        $set: { accessToken: access_token, refreshToken: refresh_token },
      });

      // Hope this doesn't fail again
      const guilds = await this.handler
        .getUserGuilds(accessToken)
        .catch(() => null);

      if (!guilds) {
        // Something went wrong
        this.logger.error(`Failed to fetch user guilds for user ${id}`);
        // lol enjoy no guilds cus cache
        return [];
      }

      return guilds;
    }

    return guilds;
  }
}
