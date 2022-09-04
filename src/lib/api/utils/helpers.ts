import { container } from "@sapphire/framework";
import { Permissions } from "discord.js";

export async function canManage(userId: string | undefined, guildId: string) {
  if (userId == null) {
    return false;
  }

  const guild = await container.client.guilds.fetch(guildId).catch(() => null);

  if (guild == null) {
    return false;
  }

  const member = guild.members.cache.get(userId);

  if (member == null) {
    return false;
  }

  return member.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
}
