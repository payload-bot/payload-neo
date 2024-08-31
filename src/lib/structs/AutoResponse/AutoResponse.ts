import type { LoaderPieceContext, MessageCommandContext } from "@sapphire/framework";
import type { Message } from "discord.js";
import { PayloadCommand } from "../commands/PayloadCommand.js";

export abstract class AutoCommand extends PayloadCommand {
  public regex: RegExp;

  constructor(context: LoaderPieceContext<"commands">, options: AutoCommandOptions) {
    super(context, { ...options, typing: true });
    this.regex = options.regex;
  }

  /**
   * Returns whether or not this command should handle this message
   * @param msg Message
   * @returns {Boolean}
   * @description Returns if this command should run or not
   */
  public shouldRun(msg: Message): boolean {
    return msg.content.match(this.regex)?.[0] ? true : false;
  }

  /**
   * Gets the resulting match for the command's regex
   * @param msg Message
   * @returns {string | null}
   * @description Gets the resulting match of the Regex defined in the command
   */
  public getMatch(msg: Message): string {
    return msg.content.match(this.regex)?.[0];
  }
}

export interface AutoCommandContext extends Pick<MessageCommandContext, "commandName"> {
  matched: string;
}

export interface AutoCommandOptions extends PayloadCommand.Options {
  regex: RegExp;
}

export namespace AutoCommand {
  export type Options = AutoCommandOptions;
  export type Args = PayloadCommand.Args;
  export type Context = AutoCommandContext;
}
