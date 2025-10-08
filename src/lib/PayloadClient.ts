import { ApplicationCommandRegistries, container, RegisterBehavior, SapphireClient } from "@sapphire/framework";
import type { Message } from "discord.js";
import { CLIENT_OPTIONS } from "#utils/clientOptions.ts";
import config from "#root/config.ts";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore.ts";
import connect from "#utils/database.ts";
import { join } from "node:path";
import { guild } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { serve } from "../api/mod.ts";

export class PayloadClient extends SapphireClient {
  public override dev = Deno.env.get("NODE_ENV") !== "production";

  constructor() {
    super(CLIENT_OPTIONS);
    this.stores.register(
      new AutoResponseStore().registerPath(
        join(import.meta.dirname!, "..", "..", "auto"),
      ),
    );
  }

  public override fetchPrefix = async (msg: Message) => {
    if (msg.guildId) {
      const [data] = await container.database
        .select({ prefix: guild.prefix })
        .from(guild)
        .where(eq(guild.id, msg.guildId));

      return data?.prefix ?? config.PREFIX;
    }

    return [config.PREFIX, ""];
  };

  public override async login(token?: string) {
    if (this.dev) {
      ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
        RegisterBehavior.BulkOverwrite,
      );
    }

    connect();

    const server = serve();
    container.denoServer = server;

    const response = await super.login(token);

    return response;
  }

  public override async destroy() {
    await container.denoServer?.shutdown();

    await super.destroy();
  }
}
