import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {
  RESTGetAPICurrentUserGuildsResult,
  RESTPostOAuth2RefreshTokenResult,
  Routes,
  RouteBases,
} from "discord-api-types/v9";
import { firstValueFrom, map, of, retryWhen, tap } from "rxjs";
import { Environment } from "#api/environment/environment";
import { UserService } from "#api/users/services/user.service";
import { container } from "@sapphire/framework";
import { GuildsService } from "#api/guilds/services/guilds.service";
import { ConvertedGuild } from "../dto/converted-guild.dto";

const { client } = container;

@Injectable()
export class DiscordService {
  constructor(
    private environment: Environment,
    private httpService: HttpService,
    private usersService: UserService,
    @Inject(forwardRef(() => GuildsService))
     // @ts-ignore
     private guildsService: GuildsService
  ) {}

  async getSortedUserGuilds(
    id: string,
    accessToken: string,
    refreshToken: string
  ) {
    const allGuilds = await this.getAllUserGuilds(
      id,
      accessToken,
      refreshToken
    );

    const convertedGuilds = await this.convertGuilds(allGuilds);

    const filteredGuilds = await this.filterGuilds(convertedGuilds);

    return filteredGuilds.sort(
      (a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1)
    );
  }

  private async filterGuilds(guilds: ConvertedGuild[]) {
    // @TODO: Allow for owners to add roles to allow dashboard access
    return guilds.filter((guild) =>
      guild.owner
        ? true
        : ((guild.permissions as unknown as number) & 0x8) === 0x8
    );
  }

  private async convertGuilds(guilds: RESTGetAPICurrentUserGuildsResult) {
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
          ...guild,
          icon,
        });
      })
    );
  }

  private async getAllUserGuilds(
    id: string,
    accessToken: string,
    refreshToken: string
  ) {
    const userGuilds$ = this.httpService
      .get<RESTGetAPICurrentUserGuildsResult>(
        RouteBases.api + Routes.userGuilds(),
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      )
      .pipe(
        retryWhen((errors) =>
          errors.pipe(tap(this.refreshUserTokens(id, refreshToken)))
        ),
        map((res) => res.data)
      );

    return await firstValueFrom(userGuilds$);
  }

  private refreshUserTokens(id: string, refreshToken: string) {
    return this.httpService
      .post<RESTPostOAuth2RefreshTokenResult>(
        RouteBases.api + Routes.oauth2TokenExchange(),
        {
          client_id: this.environment.clientId,
          client_secret: this.environment.clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .pipe(
        tap(async ({ data: { access_token, refresh_token } }) =>
          of(
            await this.usersService.updateUser(id, {
              accessToken: access_token,
              refreshToken: refresh_token,
            })
          )
        ),
        map((res) => res.data)
      );
  }
}
