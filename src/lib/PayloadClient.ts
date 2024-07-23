import { container, SapphireClient } from "@sapphire/framework";
import type { Message } from "discord.js";
import { CLIENT_OPTIONS } from "#utils/clientOptions";
import config from "#root/config";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore.js";
import connect from "#utils/database";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { guild } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";

export class PayloadClient extends SapphireClient {
  public dev = process.env.NODE_ENV !== "production";

  constructor() {
    super(CLIENT_OPTIONS);
    this.stores.register(
      (new AutoResponseStore() as any).registerPath(fileURLToPath(join(import.meta.url, "..", "..", "auto"))),
    );
  }

  public fetchPrefix = async (msg: Message) => {
    if (msg.guildId) {
      const data = await container.database
        .select({ prefix: guild.prefix })
        .from(guild)
        .where(eq(guild.id, msg.guildId));

      return data.at(0)?.prefix ?? config.PREFIX;
    }

    return [config.PREFIX, ""];
  };

  public async login(token?: string) {
    await connect();

    const response = await super.login(token);

    return response;
  }

  public async destroy() {
    super.destroy();
  }
}
