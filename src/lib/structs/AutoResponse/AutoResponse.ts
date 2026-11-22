import { Args, Command } from "@sapphire/framework";
import type { Awaitable, Message } from "discord.js";

export abstract class AutoCommand extends Command<Args, AutoCommand.Options> {
  public regex: RegExp;

  constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, { ...options, typing: true });
    this.regex = options.regex;
  }

  public abstract run(message: Message, context: AutoCommand.RunContext): Awaitable<unknown>;
}

export interface AutoCommandContext {
  matched: string;
  matches: RegExpMatchArray;
}

export interface AutoCommandOptions extends Command.Options {
  regex: RegExp;
}

export namespace AutoCommand {
  export type Options = AutoCommandOptions;
  export type LoaderContext = Command.LoaderContext;
  export type RunContext = AutoCommandContext;
}
