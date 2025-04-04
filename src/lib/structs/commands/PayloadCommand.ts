import { type MessageCommand, type LoaderPieceContext, UserError } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { Subcommand } from "@sapphire/plugin-subcommands";
import type { Message } from "discord.js";
import { Parser, ArgumentStream } from "@sapphire/lexure";
import { PayloadArgs } from "./PayloadArgs.js";
import { LibSQLDatabase } from "drizzle-orm/libsql";

export abstract class PayloadCommand extends Subcommand<PayloadCommand.Args, PayloadCommand.Options> {
  public readonly hidden: boolean;
  protected readonly database: LibSQLDatabase;

  public constructor(context: LoaderPieceContext<"commands">, options: PayloadCommand.Options) {
    super(context, options);

    this.hidden = options.hidden ?? false;
    this.database = this.container.database;
  }

  public override async messagePreParse(
    message: Message,
    parameters: string,
    context: MessageCommand.RunContext,
  ): Promise<PayloadCommand.Args> {
    const parser = new Parser(this.strategy);
    const args = new ArgumentStream(parser.run(this.lexer.run(parameters)));

    return new PayloadArgs(message, this, args, context, await fetchT(message));
  }

  protected error(identifier: string | UserError, context?: unknown): never {
    throw typeof identifier === "string" ? new UserError({ identifier, context }) : identifier;
  }
}

export namespace PayloadCommand {
  /**
   * The PayloadCommand Options
   */
  export type Options = Subcommand.Options & {
    hidden?: boolean;
  };

  export type Args = PayloadArgs;
  export type Context = Subcommand.Context;
}
