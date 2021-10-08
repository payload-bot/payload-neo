import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";

@ApplyOptions<AutoCommandOptions>({
  regex: /^hello$/,
})
export default class UserAutoCommand extends AutoCommand {
  async run(msg: Message) {
    return await msg.channel.send("<:heart_eyes:>");
  }
}
