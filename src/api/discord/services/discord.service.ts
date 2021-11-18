// @ts-nocheck
import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {
  RESTGetAPICurrentUserGuildsResult,
  RESTPostOAuth2RefreshTokenResult,
  Routes,
  RouteBases,
  OAuth2Routes,
} from "discord-api-types/v9";
import {
  catchError,
  EMPTY,
  filter,
  firstValueFrom,
  map,
  of,
  retryWhen,
  tap,
} from "rxjs";
import { Environment } from "#api/environment/environment";
import { UserService } from "#api/users/services/user.service";
import { container } from "@sapphire/framework";
import { ConvertedGuild } from "../dto/converted-guild.dto";
import { URLSearchParams } from "url";

const { client } = container;

@Injectable()
export class DiscordService {
  private logger = new Logger(DiscordService.name);

  constructor(
    private environment: Environment,
    private httpService: HttpService,
    private usersService: UserService
  ) {}

  async revokeUserTokens(token: string) {
    const formData = new URLSearchParams();

    formData.append("client_id", this.environment.clientId);
    formData.append("client_secret", this.environment.clientSecret);
    formData.append("token", token);

    const revoke$ = this.httpService.post(
      OAuth2Routes.tokenRevocationURL,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    await firstValueFrom(revoke$);
  }

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
        catchError(({ response }) => {
          this.logger.warn(
            `Encountered an error while fetching user servers for ${id}`
          );
          this.logger.warn(response.data);
        }),
        retryWhen((errors) => {
          return errors.pipe(
            filter(({ response }) => [401, 400].includes(response.status)),
            tap(this.refreshUserTokens(id, refreshToken))
          );
        }),
        map((res) => res.data)
      );

    return await firstValueFrom(userGuilds$);
  }

  private refreshUserTokens(id: string, refreshToken: string) {
    const formData = new URLSearchParams();

    formData.append("client_id", this.environment.clientId);
    formData.append("client_secret", this.environment.clientSecret);
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", refreshToken);

    return this.httpService
      .post<RESTPostOAuth2RefreshTokenResult>(
        RouteBases.api + Routes.oauth2TokenExchange(),
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .pipe(
        tap(async ({ data: { access_token, refresh_token } }) => {
          return of(
            await this.usersService.updateUser(id, {
              accessToken: access_token,
              refreshToken: refresh_token,
            })
          );
        }),
        map((res) => res.data),
        catchError(({ response }) => {
          this.logger.error(response.data);
          return EMPTY;
        })
      );
  }
}
