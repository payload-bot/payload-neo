import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Sends a discord invite link for Payload",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message) {
    return await send(msg, "<https://payload.tf/invite>");
  }
}
