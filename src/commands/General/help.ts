import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { codeBlock } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
  description: "Displays all commands",
})
export class UserCommand extends Command {
  async run(msg: Message) {
    const { stores } = this.container;

    const commands = [...stores.get("commands").values()];
    const autoCommands = [...stores.get("autoresponses" as any).values()];

    const embed = new MessageEmbed({
      title: "List of Commands",
      color: PayloadColors.USER,
      fields: [
        {
          name: "Commands",
          value: commands.map((c) => codeBlock(c.name)).join(", "),
        },
        {
          name: "Auto Commands",
          value: autoCommands.map((ac) => codeBlock(ac.name)).join(", "),
        },
      ],
    });

    return await send(msg, { embeds: [embed] });
  }
}
