import type { Message } from "discord.js";
import type { TFunction } from "i18next";
import type { ArgumentStream } from "@sapphire/lexure";
import { Args, type MessageCommand } from "@sapphire/framework";

export class PayloadArgs extends Args {
  public t: TFunction;

  public constructor(
    message: Message,
    command: MessageCommand,
    parser: ArgumentStream,
    context: MessageCommand.RunContext,
    t: TFunction,
  ) {
    super(message, command, parser, context);
    this.t = t;
  }
}

declare module "@sapphire/framework" {
  export interface Args {
    t: TFunction;
  }
}
