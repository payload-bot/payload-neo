process.env.NODE_ENV ??= "development";

import { SapphireClient } from "@sapphire/framework";
import { Enumerable } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { join } from "path";
import { CLIENT_OPTIONS } from "#utils/clientOptions";
import { Server } from "./models/Server";
import config from "#root/config";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore";

export class PayloadClient extends SapphireClient {
  @Enumerable(false)
  public dev = process.env.NODE_ENV !== "production";

  constructor() {
    super(CLIENT_OPTIONS);

    this.stores.register(new AutoResponseStore().registerPath(join(__dirname, '..', 'commands/Auto')));
  }

  public fetchPrefix = async (msg: Message) => {
    if (msg.guildId) {
      const server = await Server.findOne({ id: msg.guildId }).lean().exec();

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