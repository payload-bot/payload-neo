import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>({
  description: "Returns avatar of user.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const mention = await args.pick("user").catch(() => msg.author);

    return await send(msg, mention.displayAvatarURL());
  }
}
