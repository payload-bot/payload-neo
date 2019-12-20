import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import { weightedRandom } from "../../../util/random";
import LeaderboardCommand from "./leaderboard";
import RankCommand from "./rank";
import GiftCommand from "./gift";
import ServersCommand from "./servers";
import config from "../../../config";

export default class PushCart extends Command {
    constructor() {
        super(
            "pushcart",
            "Pushes the cart 3-17 feet.",
            [
                {
                    name: "subcommand",
                    description: "An optional subcommand can go here.",
                    required: false,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            ["text"],
            undefined,
            {
                leaderboard: new LeaderboardCommand(),
                rank: new RankCommand(),
                gift: new GiftCommand(),
                servers: new ServersCommand()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);

        let prefix;
        try {
            prefix = await this.getPrefix(msg.guild.id)
        } catch (e) {
            prefix = config.PREFIX;
        }

        if (args[0]) {
            if (!this.subCommands[args[0]]) {
                await this.respond(msg, `Invalid subcommand. Type \`${prefix}pushcart\` to learn more.`);

                return false;
            }

            return await this.runSub(args[0], client, msg);
        }

        const user = await client.userManager.getUser(msg.author.id);
        const server = await client.serverManager.getServer(msg.guild.id);

        const feetPushed = weightedRandom([
            { number: 3, weight: 1 },
            { number: 4, weight: 2 },
            { number: 5, weight: 4 },
            { number: 6, weight: 8 },
            { number: 7, weight: 16 },
            { number: 8, weight: 16 },
            { number: 9, weight: 16 },
            { number: 10, weight: 16 },
            { number: 11, weight: 18 },
            { number: 12, weight: 18 },
            { number: 13, weight: 16 },
            { number: 14, weight: 8 },
            { number: 15, weight: 4 },
            { number: 16, weight: 2 },
            { number: 17, weight: 1 },
        ]);

        const pushResult = user.addCartFeet(feetPushed);

        if (pushResult == "COOLDOWN") {
            const secondsRemaining = Math.round(
                (
                    (user.user.fun!.payload.lastPushed + 1000 * 30)
                    - Date.now()
                )
                / 1000
            );

            return await this.fail(msg, `You must wait 30 seconds before pushing the cart again (${secondsRemaining} left).`)
        } else if (pushResult == "CAP") {
            return await this.fail(msg, "You have reached the max number of points for today. Come back tomorrow!");
        }

        server.addCartFeet(feetPushed);

        await Promise.all([
            user.save(),
            server.save()
        ]);

        await this.respond(msg, `<:payload:597506053021630464> Pushed the cart forward **${feetPushed}** feet (${server.server.fun!.payloadFeetPushed} total).`);

        return true;
    }
}