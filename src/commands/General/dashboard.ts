import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>({
  description: "Links to the dashboard",
  runIn: ["GUILD_TEXT"],
})
export class UserCommand extends Command {
  async run(msg: Message) {
    const component = new MessageActionRow().addComponents([
      new MessageButton({
        url: `https://payload.tf/dashboard/${msg.guild!.id}`,
        style: "LINK",
        label: "Visit Dashboard",
      }),
    ]);

    return await send(msg, {
      content: "Visit the dashboard",
      components: [component],
    });
  }
}
