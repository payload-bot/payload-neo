import { container, SapphireClient } from "@sapphire/framework";
import type { Message } from "discord.js";
import { join } from "path";
import { CLIENT_OPTIONS } from "#utils/clientOptions";
import config from "#root/config";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore";
import type { SnipeCache } from "./interfaces/cache";

process.env.NODE_ENV ??= "development";

export class PayloadClient extends SapphireClient {
  public dev = process.env.NODE_ENV !== "production";

  public cache: SnipeCache = {
    snipe: {},
    pings: {},
  };

  constructor() {
    super(CLIENT_OPTIONS);

    this.stores.register(new AutoResponseStore().registerPath(join(__dirname, "..", "auto")));
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
    const response = await super.login(token);

    return response;
  }

  public destroy() {
    super.destroy();
  }
}
