import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { random } from "../../../util/random";
import { bold } from "@discordjs/builders";

export default class RTD extends Command {
  constructor() {
    super(
      "rtd",
      "Rolls a die with 6 sides or a die with [sides] sides if specified or [amount] dice with [sides] sides if specified.",
      [
        {
          name: "sides",
          description: "The amount of sides that the dice should have.",
          required: false,
          type: "number",
          min: 2,
        },
        {
          name: "amount",
          description: "The amount of dice to roll.",
          required: false,
          type: "number",
          min: 1,
          max: 6,
        },
      ]
    );
  }

  async run(client: Client, msg: Message): Promise<boolean> {
    const args = await this.parseArgs(msg);

    if (args === false) {
      return false;
    }

    const sides = (args[0] as Number) || 6;
    const amount = (args[1] as Number) || 1;

    let dice: number[] = [];

    for (let i = 0; i < Math.round(Number(amount)); i++) {
      dice.push(random(1, Math.round(Number(sides))));
    }

    const rolls = dice.map((roll) => bold(roll.toString())).join(" | ");

    await this.respond(msg, `🎲 ${rolls}`);

    return true;
  }
}
