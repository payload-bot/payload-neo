import {
  AliasPiece,
  PieceContext,
  PieceOptions,
  Awaitable,
  CommandOptions,
} from "@sapphire/framework";
import type { TFunction } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

export interface AutoCommandOptions extends PieceOptions, CommandOptions {
  regex: RegExp;
}

export abstract class AutoCommand extends AliasPiece {
  public regex: RegExp;

  constructor(context: PieceContext, options: AutoCommandOptions) {
    super(context, { ...options });
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

  public abstract messageRun(msg: Message, t: TFunction): Awaitable<unknown>;
}
