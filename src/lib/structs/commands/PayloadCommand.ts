import { type LoaderPieceContext, UserError } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { PayloadArgs } from "./PayloadArgs.ts";
import type { NodeSQLiteDatabase } from "drizzle-orm/node-sqlite"

export abstract class PayloadCommand extends Subcommand<PayloadCommand.Args, PayloadCommand.Options> {
  public readonly hidden: boolean;
  protected readonly database: NodeSQLiteDatabase;

  public constructor(context: LoaderPieceContext<"commands">, options: PayloadCommand.Options) {
    super(context, options);

    this.hidden = options.hidden ?? false;
    this.database = this.container.database;
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

  export type Context = Subcommand.LoaderContext;
}
