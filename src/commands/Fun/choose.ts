import type { Args, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { random } from "#utils/random";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Randomly chooses <amount> options from a list.",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const amount = await args.pick("number").catch(() => 1);
    const options = await args.repeat("string");

    if (options.length == 0) return await send(msg, "none");

    const chosen = [];

    for (let i = 0; i < amount; i++) {
      const chosenIndex = random(0, options.length - 1);
      chosen.push(options.splice(chosenIndex, 1));
    }

    return await send(msg, chosen.join(", "));
  }
}
