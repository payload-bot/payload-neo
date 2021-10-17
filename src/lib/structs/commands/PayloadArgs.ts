import type { PayloadCommand } from "./PayloadCommand";
import { Args, CommandContext } from "@sapphire/framework";
import type { Message } from "discord.js";
import type { TFunction } from "i18next";
import type { Args as LexureArgs } from "lexure";

export class PayloadArgs extends Args {
  public t: TFunction;

  public constructor(
    message: Message,
    command: PayloadCommand,
    parser: LexureArgs,
    context: CommandContext,
    t: TFunction
  ) {
    super(message, command, parser, context);
    this.t = t;
  }
}

export interface PayloadArgs {
  command: PayloadCommand;
}

declare module "@sapphire/framework" {
  export interface Args {
    t: TFunction;
  }
}
