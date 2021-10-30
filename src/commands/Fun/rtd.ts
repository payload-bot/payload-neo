import type { Args, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { bold } from "@discordjs/builders";
import { random } from "#utils/random";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Rtd.Description,
  detailedDescription: LanguageKeys.Commands.Rtd.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const sides = await args.pick("number").catch(() => 6);
    const amount = await args.pick("number").catch(() => 1);
    
    const dice: number[] = [];
    for (let i = 0; i < amount; i++) dice.push(random(1, sides));

    const rolls = dice.map((roll) => bold(roll.toString())).join(" | ");
    return await send(msg, `🎲 ${rolls}`);
  }
}
