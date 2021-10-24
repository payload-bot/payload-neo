import axios from "axios";
import { Args, BucketScope, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config";
import { capturePage } from "#utils/screenshot";
import { User } from "#lib/models/User";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description:
    "Displays the latest log of the (mentioned) user. Must have your steamid linked through the bot.",
  cooldownDelay: 1000,
  cooldownLimit: 1,
  cooldownScope: BucketScope.User,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const { id } = await args.pick("member").catch(() => msg.author);

    await msg.channel.sendTyping();

    const user = await User.findOne({ id }).lean()

    if (!user?.steamId) {
      return await send(msg, "no steamid linked");
    }

    const { data } = await axios.get<{ logs: any }>(
      `http://logs.tf/api/v1/log?limit=1&player=${user.steamId}`
    );

    if (!!data.logs) {
      return await send(msg, "no log history");
    }

    const logID = data.logs[data.logs.length - 1].id;

    const screenshotBuffer = await capturePage(
      `http://logs.tf/${logID}#${user.steamId}`,
      {
        top: {
          selector: "#log-header",
          edge: "top",
        },
        left: {
          selector: "#log-header",
          edge: "left",
        },
        right: {
          selector: "#log-header",
          edge: "right",
        },
        bottom: {
          selector: "#log-section-players",
          edge: "bottom",
        },

        cssPath: config.files.LOGS_CSS,
      }
    );

    await send(msg, {
      content: `<http://logs.tf/${logID}#${user.steamId}>`,
      files: [screenshotBuffer],
    });

    return true;
  }
}
