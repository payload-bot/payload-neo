import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class PugScrim extends Command {

    constructor() {
        super(
            "pugscrim",
            "Starts a pugscrim. First 5 people to type !pug will be drafted into the pugscrim. Sends info automatically when recieved.",
            undefined,
            ["READ_MESSAGE_HISTORY", "SEND_MESSAGES", "READ_MESSAGES"],
            ["MANAGE_MESSAGES", "MANAGE_ROLES_OR_PERMISSIONS"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let gamers: Array<String> = [];
        let info: any;
        let gamerArray;

        try {
            let filter = m => m.content.startsWith('!pug');
            msg.channel.send("Pugscrim time. Type `!pug` to be included in the draft.");

            gamerArray = await msg.channel.awaitMessages(filter, { maxMatches: 6, time: 100000, errors: ["time"] });

            let authorDM = await msg.author.createDM();
            authorDM.send("I need info!");
            info = await authorDM.awaitMessages(m => m.content.match(/connect\s[\d+\w+].+;\spassword\s[\w+\d+\"]+/gi), { maxMatches: 1, time: 100000, errors: ["time"] });

            await this.respond(msg, `I have 6 players. They are: ${gamers.join(", ")}`)

            gamerArray.forEach(async user => {
                gamers.push(user.author.tag);
                let pugger = await user.author.createDM();
                await pugger.send(`You are drafted into a pugscrim.\nInfo: ${info.first()}`);
            });
        }
        catch (e) {
            return this.fail(msg, "You didn't provide parameters. Please try again..");
        }
        return true;
    }
}