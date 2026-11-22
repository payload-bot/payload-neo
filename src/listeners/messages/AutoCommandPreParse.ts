import { AutoCommandEvents } from "#root/lib/structs/AutoResponse/AutoCommandEvents.ts";
import type { AutoCommand } from "#root/lib/structs/AutoResponse/AutoResponse.ts";
import type { AutoResponseStore } from "#root/lib/structs/AutoResponse/AutoResponseStore.ts";
import { isDMChannel, type GuildBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { Events, Listener } from "@sapphire/framework";
import { Message, PermissionFlagsBits, PermissionsBitField } from "discord.js";

export class PluginListener extends Listener<typeof Events.PreMessageParsed> {
  private readonly requiredPermissions = new PermissionsBitField([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
  ]).freeze();

  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.PreMessageParsed });
  }

  public override async run(message: Message) {
    const canRun = await this.canRunInChannel(message);
    if (!canRun) {
      return;
    }

    let { content } = message;
    const { client, stores } = this.container;

    const autoCommandStore = stores.get("auto") as AutoResponseStore | undefined;

    if (!autoCommandStore) {
      return;
    }

    const possibleAutoCommands: Array<AutoCommand> = [];

    for (const [_, autoCommand] of autoCommandStore) {
      if (autoCommand.regex.test(content)) {
        possibleAutoCommands.push(autoCommand);
      }
    }

    if (possibleAutoCommands.length > 0) {
      client.emit(AutoCommandEvents.PreCommandRun, {
        message,
        possibleAutoCommands: possibleAutoCommands,
      });
    }
  }

  private async canRunInChannel(message: Message): Promise<boolean> {
    if (isDMChannel(message.channel)) {
      return true;
    }

    const me = await message.guild?.members.fetchMe();
    if (!me) {
      return false;
    }

    const channel = message.channel as GuildBasedChannelTypes;
    return channel.permissionsFor(me).has(this.requiredPermissions, false);
  }
}
