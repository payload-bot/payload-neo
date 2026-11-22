import { Args, Command } from "@sapphire/framework";
import type { Awaitable, Message } from "discord.js";

export abstract class AutoCommand extends Command<Args, AutoCommand.Options> {
  public regex: RegExp;

  constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
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
  public getMatch(msg: Message): string | undefined {
    return msg.content.match(this.regex)?.[0];
  }

  /**
   * Gets the resulting match for the command
   */
  public getMatches(msg: Message): RegExpMatchArray | null {
    return msg.content.match(this.regex);
  }

  public abstract run(message: Message, context: AutoCommand.LoaderContext): Awaitable<unknown>;
}

export interface AutoCommandContext extends Command.LoaderContext {
  matched: string;
  matches: RegExpMatchArray;
}

export interface AutoCommandOptions extends Command.Options {
  regex: RegExp;
}

export namespace AutoCommand {
  export type Options = AutoCommandOptions;
  export type LoaderContext = AutoCommandContext;
}
