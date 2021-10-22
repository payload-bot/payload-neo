import type { Args, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Bruh.",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const mention = await args.pick("user").catch(() => null);

    if (mention) return await send(msg, `bruh ${mention.toString()}`);

    return await send(msg, `bruh`);
  }
}
