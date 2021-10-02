import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { random } from "#utils/random";
import { bold } from "@discordjs/builders";

@ApplyOptions<CommandOptions>({
  description:
    "Rolls a die with 6 sides or a die with [sides] sides if specified or [amount] dice with [sides] sides if specified.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const sides = await args.pick("number").catch(() => 6);
    const amount = await args.pick("number").catch(() => 1);
    let dice: number[] = [];

    for (let i = 0; i < Math.round(Number(amount)); i++)
      dice.push(random(1, Math.round(Number(sides))));

    const rolls = dice.map((roll) => bold(roll.toString())).join(" | ");
    return await send(msg, `🎲 ${rolls}`);
  }
}
