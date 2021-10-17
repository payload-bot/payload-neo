import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>({
  description: "User settings",
})
export class UserCommand extends Command {
  async run(msg: Message) {
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
