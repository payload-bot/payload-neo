import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";
import { PayloadCommand } from "../commands/PayloadCommand";

export interface AutoCommandOptions extends PayloadCommand.Options {
  regex: RegExp;
}

export abstract class AutoCommand extends PayloadCommand {
  public regex: RegExp;

  constructor(context: PieceContext, options: AutoCommandOptions) {
    super(context, { ...options, typing: true });
    this.regex = options.regex;
  }

  /**
   *
   * @param msg Message
   * @returns {Boolean}
   * @description Returns if this command should run or not
   */
  public shouldRun(msg: Message): boolean {
    return msg.content.match(this.regex)?.[0] ? true : false;
  }

  /**
   *
   * @param msg Message
   * @returns {string | null}
   * @description Gets the resulting match of the Regex defined in the command
   */
  public getMatch(msg: Message): string {
    return msg.content.match(this.regex)![0];
  }
}
