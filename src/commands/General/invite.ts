import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

// Copy pasted from payload.tf/invite
const INVITE_LINK =
  "https://discord.com/oauth2/authorize?redirect_uri=https%3A%2F%2Fapi.payload.tf%2Fapi%2Fauth%2Fdiscord%2Fcallback&client_id=644333502870978564&permissions=67496000&scope=bot%20applications.commands";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Invite.Description,
  detailedDescription: LanguageKeys.Commands.Invite.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const component = new MessageActionRow().addComponents([
      new MessageButton({
        label: args.t(LanguageKeys.Commands.Invite.Button),
        url: INVITE_LINK,
        style: "LINK",
      }),
    ]);

    await send(msg, {
      content: args.t(LanguageKeys.Commands.Invite.Description),
      components: [component],
    });
  }
}
