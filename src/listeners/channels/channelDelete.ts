import { webhook } from "#root/drizzle/schema.ts";
import { Events, Listener } from "@sapphire/framework";
import type { Channel } from "discord.js";
import { eq } from "drizzle-orm";
import { isNullishOrEmpty } from "@sapphire/utilities";

export class ChannelDeleteListener extends Listener<typeof Events.ChannelDelete> {
  public async run(channel: Channel) {
    const wh = await this.container.database
      .select()
      .from(webhook)
      .where(eq(webhook.id, channel.id));

    if (!isNullishOrEmpty(wh)) {
      this.container.logger.info("deleting channel webhook", { channelId: channel.id });
      await this.container.database.delete(webhook).where(eq(webhook.id, channel.id));
    }
  }
}
