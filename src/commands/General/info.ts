import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>({
  description: "Information about the Payload client",
})
export class UserCommand extends Command {
  async run(msg: Message) {
    return await send(msg, `info`);
  }
}
