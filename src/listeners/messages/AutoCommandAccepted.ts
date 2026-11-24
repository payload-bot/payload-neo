import { commandCounter } from "#root/lib/metrics.ts";
import { AutoCommandEvents } from "#root/lib/structs/AutoResponse/AutoCommandEvents.ts";
import type { AutoCommandAcceptedPayload } from "#root/lib/structs/AutoResponse/AutoCommandTypes.ts";
import { Listener } from "@sapphire/framework";

export class AutoCommandAcceptedListener extends Listener<
  typeof AutoCommandEvents.CommandAccepted
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: AutoCommandEvents.CommandAccepted });
  }

  public override async run({ command, message, context }: AutoCommandAcceptedPayload) {
    commandCounter.inc({ command: command.name, auto: "true" });

    if (message.channel.isSendable()) {
      await message.channel.sendTyping();
    }

    await command.run(message, context);
  }
}
