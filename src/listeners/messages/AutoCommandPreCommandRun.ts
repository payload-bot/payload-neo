import { AutoCommandEvents } from "#root/lib/structs/AutoResponse/AutoCommandEvents.ts";
import type {
  AutoCommandAcceptedPayload,
  AutoCommandPreCommandPayload,
} from "#root/lib/structs/AutoResponse/AutoCommandTypes.ts";
import type { AutoCommand } from "#root/lib/structs/AutoResponse/AutoResponse.ts";
import { Listener } from "@sapphire/framework";

export class AutoCommandPreCommandRunListener extends Listener<
  typeof AutoCommandEvents.PreCommandRun
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: AutoCommandEvents.PreCommandRun });
  }

  public override async run({ message, possibleAutoCommands }: AutoCommandPreCommandPayload) {
    for (const autoResponse of possibleAutoCommands) {
      const payload = {
        message,
        command: autoResponse,
      };

      // Run global preconditions:
      const globalResult = await this.container.stores
        .get("preconditions")
        .messageRun(message, autoResponse as any, payload);

      if (globalResult.isErr()) {
        continue;
      }

      // Run command-specific preconditions:
      const localResult = await autoResponse.preconditions.messageRun(
        message,
        autoResponse as any,
        payload,
      );

      if (localResult.isErr()) {
        continue;
      }

      const context: AutoCommand.RunContext = {
        matched: message.content.match(autoResponse.regex)![0],
        matches: message.content.match(autoResponse.regex)!,
      };

      const acceptedPayload: AutoCommandAcceptedPayload = {
        command: autoResponse,
        message,
        context,
      };

      message.client.emit(AutoCommandEvents.CommandAccepted, acceptedPayload);
    }
  }
}
