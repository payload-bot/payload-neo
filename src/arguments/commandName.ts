import { LanguageKeys } from "#lib/i18n/all";
import type { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { Argument, Command, type ArgumentContext } from "@sapphire/framework";

type CommandReturn = PayloadCommand | AutoCommand | undefined;

export class UserArgument extends Argument<Command> {
  public run(parameter: string, context: ArgumentContext) {
    const commands = this.container.stores.get("commands");
    const autoCommands = this.container.stores.get("auto");

    let found = commands.get(parameter.toLowerCase()) as CommandReturn;

    found ??= autoCommands.get(parameter.toLowerCase()) as CommandReturn;

    if (found) {
      return this.ok(found);
    }

    // make this identifier something in the future
    return this.error({ parameter, identifier: LanguageKeys.Arguments.Command, context });
  }
}
