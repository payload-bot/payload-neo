import { Server, User } from "#lib/models";
import type { AutoResponseStore } from "#lib/structs/AutoResponse/AutoResponseStore";
import config from "#root/config";
import { container } from "@sapphire/framework";
import type { LoginData } from "@sapphire/plugin-api";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v9";
import { Guild, Permissions } from "discord.js";

export async function transformAuth({ user, guilds }: LoginData) {
  if (!user || !guilds) {
    return { user, guilds };
  }

  const { client } = container;

  // @ts-ignore
  const [dbUser, fetchedDiscordUser] = await Promise.all([
    User.findOne({ id: user.id }).lean(),
    client.users.fetch(user.id),
  ]);

  return {
    user: {
      ...user,
      avatar: fetchedDiscordUser.displayAvatarURL(),
      pushcartPoints: dbUser?.fun?.payload?.feetPushed ?? 0,
    },
    guilds: await Promise.all(guilds.map(g => transformGuild(user.id, g))),
  };
}

export async function getManageable(id: string, oauthGuild: RESTAPIPartialCurrentUserGuild, guild: Guild | undefined) {
  if (oauthGuild.owner) {
    return true;
  }

  if (typeof guild === "undefined") {
    return new Permissions(BigInt(oauthGuild.permissions)).has(Permissions.FLAGS.MANAGE_GUILD);
  }

  const member = await guild.members.fetch(id).catch(() => null);
  if (!member) {
    return false;
  }

  return false;
}

async function transformGuild(userId: string, data: RESTAPIPartialCurrentUserGuild) {
  const { client, stores } = container;

  const isInGuild = client.guilds.cache.get(data.id);

  const commands = stores.get("commands");
  const autoCommands = stores.get("autoresponses") as unknown as AutoResponseStore;

  const dbGuild = (await Server.findOne({ id: data.id }).populate("webhook")) as any;

  const clientGuild = client.guilds.cache.get(data.id);

  return {
    ...data,
    prefix: dbGuild?.prefix ?? config.PREFIX,
    language: dbGuild?.language ?? "en-US",
    enableSnipeForEveryone: dbGuild?.enableSnipeForEveryone ?? false,
    webhook: dbGuild?.webhook ?? null,
    isInGuild,
    id: data.id,
    managable: getManageable(userId, data, clientGuild),
    icon: clientGuild?.iconURL() as any,
    permissions: data.permissions,
    pushcartPoints: dbGuild?.fun?.payloadFeetPushed ?? 0,
    channels: clientGuild?.channels.cache.filter(c => c.type === "GUILD_TEXT").map(({ id, name }) => ({ id, name })),
    commands: {
      restrictions: dbGuild?.commandRestrictions ?? [],
      commands: commands.filter(c => c.enabled).map(c => c.name),
      autoResponses: autoCommands.filter(c => c.enabled).map(c => c.name),
    },
  };
}
