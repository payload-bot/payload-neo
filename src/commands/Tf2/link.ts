import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { User } from "#lib/models/User";
import { getSteamIdFromArgs } from "#utils/getSteamId";

@ApplyOptions<CommandOptions>({
  description: "Links your steam account to your Discord account.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const steamId = await args.pick("string").catch(() => null);

    if (!steamId) {
      return await send(msg, "missing argument");
    }

    const testResult = await getSteamIdFromArgs(steamId);

    if (!testResult) {
      return await send(msg, "malformed steamid");
    }

    await User.findOneAndUpdate({ id: msg.author.id }, { steamId });

    return await send(msg, "linked success");
  }
}
