import axios from "axios";
import { BucketScope, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config";
import { capturePage } from "#utils/screenshot";
import { User } from "#lib/models/User";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description:
    "Displays the latest log of the (mentioned) user. Must have your steamid linked through the bot.",
  cooldownDelay: 1500,
  cooldownLimit: 1,
  cooldownScope: BucketScope.User,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { id, tag } = await args.pick("user").catch(() => msg.author);

    await msg.channel.sendTyping();

    const user = await User.findOne({ id }).lean();

    if (!user?.steamId) {
      return await send(
        msg,
        args.t(LanguageKeys.Commands.Log.NoIdLinked, { user: tag })
      );
    }

    const { data } = await axios.get<{ logs: any }>(
      `http://logs.tf/api/v1/log?limit=1&player=${user.steamId}`
    );

    if (!!data.logs) {
      return await send(msg, args.t(LanguageKeys.Commands.Log.NoHistory));
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

    const linkButton = new MessageActionRow().addComponents(
      new MessageButton({
        label: args.t(LanguageKeys.Commands.Log.Button),
        url: `<http://logs.tf/${logID}#${user.steamId}>`,
        style: "LINK",
      })
    );

    await send(msg, {
      files: [screenshotBuffer],
      components: [linkButton],
    });

    return true;
  }
}
