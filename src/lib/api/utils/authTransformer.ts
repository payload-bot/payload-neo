import type { AutoResponseStore } from "#lib/structs/AutoResponse/AutoResponse.jsStore";
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
    container.database.user.upsert({ where: { id: user.id }, create: { id: user.id }, update: {} }),
    client.users.fetch(user.id),
  ]);

  return {
    user: {
      ...user,
      avatar: fetchedDiscordUser.displayAvatarURL(),
      pushcartPoints: dbUser?.pushed ?? 0,
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

  const dbGuild = await container.database.guild.findUnique({ where: { id: data.id } });

  const clientGuild = client.guilds.cache.get(data.id);

  return {
    ...data,
    prefix: dbGuild?.prefix ?? config.PREFIX,
    language: dbGuild?.language ?? "en-US",
    enableSnipeForEveryone: dbGuild?.enableSnipeForEveryone ?? false,
    isInGuild,
    id: data.id,
    managable: await getManageable(userId, data, clientGuild),
    icon: clientGuild?.iconURL() as any,
    permissions: data.permissions,
    pushcartPoints: dbGuild?.pushed ?? 0,
    channels: clientGuild?.channels.cache.filter(c => c.type === "GUILD_TEXT").map(({ id, name }) => ({ id, name })),
    commands: {
      restrictions: dbGuild?.commandRestrictions ?? [],
      commands: commands.filter(c => c.enabled).map(c => c.name),
      autoResponses: autoCommands.filter(c => c.enabled).map(c => c.name),
    },
  };
}
