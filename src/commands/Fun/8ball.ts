import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { bold } from "@discordjs/builders";
import { random } from "#utils/random";
import { send } from "@sapphire/plugin-editable-commands";

const responses: readonly string[] = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes - definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",

  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",

  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

@ApplyOptions<CommandOptions>({
  description: "Asks the 8ball a question",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const question = await args.rest("string").catch(() => null);

    if (!question) return await send(msg, "No question");

    const response = responses[random(0, responses.length - 1)];

    return await send(msg, `🎱 ${bold(response)}`);
  }
}
