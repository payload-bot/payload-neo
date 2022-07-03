import type { PrismaClient } from "@prisma/client";
import { CommandContext, PieceContext, UserError } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { SubCommandPluginCommand } from "@sapphire/plugin-subcommands";
import type { Message } from "discord.js";
import * as Lexure from "lexure";
import { PayloadArgs } from "./PayloadArgs";

export abstract class PayloadCommand extends SubCommandPluginCommand<PayloadCommand.Args, PayloadCommand> {
  public readonly hidden: boolean;
  protected database: PrismaClient;

  public constructor(context: PieceContext, options: PayloadCommand.Options) {
    super(context, { ...options });

    this.hidden = options.hidden ?? false;
    this.database = this.container.database;
  }

  /**
   * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
   * @param message The message that triggered the command.
   * @param parameters The raw parameters as a single string.
   * @param context The command-context used in this execution.
   */
  public async preParse(message: Message, parameters: string, context: CommandContext): Promise<PayloadCommand.Args> {
    const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
    const args = new Lexure.Args(parser.parse());

    return new PayloadArgs(message, this, args, context, await fetchT(message));
  }

  protected error(identifier: string | UserError, context?: unknown): never {
    throw typeof identifier === "string" ? new UserError({ identifier, context }) : identifier;
  }

  protected parseConstructorPreConditions(options: PayloadCommand.Options): void {
    super.parseConstructorPreConditions(options);
  }
}

export namespace PayloadCommand {
  /**
   * The PayloadCommand Options
   */
  export type Options = SubCommandPluginCommand.Options & {
    hidden?: boolean;
  };

  export type Args = PayloadArgs;
  export type Context = CommandContext;
}
