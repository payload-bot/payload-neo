import { container, SapphireClient } from "@sapphire/framework";
import type { Message } from "discord.js";
import { CLIENT_OPTIONS } from "#utils/clientOptions";
import config from "#root/config";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore.js";
import connectDatabase from "#utils/connectDatabase";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export class PayloadClient extends SapphireClient {
  public dev = process.env.NODE_ENV !== "production";

  constructor() {
    super(CLIENT_OPTIONS);
    this.stores.register(
      new AutoResponseStore().registerPath(fileURLToPath(join(import.meta.url, "..", "..", "auto")))
    );
  }

  public fetchPrefix = async (msg: Message) => {
    if (msg.guildId) {
      const server = await container.database.guild.findUnique({
        where: { id: msg.guildId },
        select: { prefix: true },
      });

      return server?.prefix ?? config.PREFIX;
    }

    return [config.PREFIX, ""];
  };

  public async login(token?: string) {
    await connectDatabase();

    const response = await super.login(token);

    return response;
  }

  public destroy() {
    super.destroy();
  }
}
