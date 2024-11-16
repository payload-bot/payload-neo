import { CommandOptionsRunTypeEnum, type CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, EmbedBuilder, codeBlock } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors";
import { webhook } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Info.Description,
  detailedDescription: LanguageKeys.Commands.Info.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.Dm],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { client } = this.container;

    const [v] = await this.database.select({ value: webhook.value }).from(webhook).where(eq(webhook.id, msg.author.id));

    if (isNullOrUndefinedOrEmpty(v)) {
      const embed = new EmbedBuilder({
        title: args.t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: args.t(LanguageKeys.Commands.Webhook.NoWebhook),
        color: PayloadColors.Payload,
      });

      await send(msg, { embeds: [embed] });
    }

    const embed = new EmbedBuilder({
      author: {
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      },
      title: args.t(LanguageKeys.Commands.Webhook.EmbedTitle),
      description: codeBlock(v.value),
      color: PayloadColors.Payload,
    });

    await send(msg, { embeds: [embed] });
  }
}
