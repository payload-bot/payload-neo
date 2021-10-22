import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "User settings",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message) {
    const component = new MessageActionRow().addComponents([
      new MessageButton({
        url: "https://payload.tf/settings",
        style: "LINK",
        label: "User Settings",
      }),
    ]);
    
    return await send(msg, {
      content: "Update your settings from the dashboard",
      components: [component],
    });
  }
}
