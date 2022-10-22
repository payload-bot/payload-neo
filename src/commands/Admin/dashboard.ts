import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<PayloadCommand.Options>({
  description: LanguageKeys.Commands.Dashboard.Description,
  detailedDescription: LanguageKeys.Commands.Dashboard.DetailedDescription,
  runIn: ["GUILD_TEXT"],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const component = new MessageActionRow().addComponents([
      new MessageButton({
        url: `https://payload.tf/dashboard/${msg.guild!.id}`,
        style: "LINK",
        label: args.t(LanguageKeys.Commands.Dashboard.Button),
      }),
    ]);

    await send(msg, {
      content: args.t(LanguageKeys.Commands.Dashboard.Title),
      components: [component],
    });
  }
}
