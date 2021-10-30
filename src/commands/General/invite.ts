import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Invite.Description,
  detailedDescription: LanguageKeys.Commands.Invite.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message) {
    return await send(msg, "<https://payload.tf/invite>");
  }
}
