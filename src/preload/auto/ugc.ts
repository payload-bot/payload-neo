import { Client } from "../../lib/types/Client";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import { captureSelector } from "../../util/screenshot";
import PayloadColors from "../../lib/misc/colors";

export default class UGC extends AutoResponse {

    constructor() {
        super(
            "ugc",
            "UGC Team Previews.",
            /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = this.matchMsg(msg);

        const screenshotBuffer = await captureSelector("http://" + url, "div.col-md-8");
        const att = new MessageAttachment(screenshotBuffer, "team.png");
        const embed = new MessageEmbed();
        embed.setColor(PayloadColors.COMMAND);
        embed.setTitle("UGC Team Preview");
        embed.setURL(`https://${url}`);
        embed.setImage(`attachment://team.png`);
        embed.setFooter(`Rendered by autoresponse ${this.name}`);
        embed.setTimestamp(new Date());

        msg.channel.send({ embed, files: [att] });
    }
}