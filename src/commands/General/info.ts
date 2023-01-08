import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Info.Description,
  detailedDescription: LanguageKeys.Commands.Info.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { client } = this.container;

    const membersServing = client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0);

    const guildsServing = client.guilds.cache.size;

    const embed = new EmbedBuilder({
      author: {
        name: client.user!.username,
        iconURL: client.user!.displayAvatarURL(),
      },
      title: args.t(LanguageKeys.Commands.Info.EmbedTitle, {
        users: membersServing,
        servers: guildsServing,
      }),
      description: args.t(LanguageKeys.Commands.Info.EmbedDescription),
      color: PayloadColors.Payload,
    });

    await send(msg, { embeds: [embed] });
  }
}
