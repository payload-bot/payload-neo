import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import { weightedRandom } from "../../../util/random";

export default class PushCart extends Command {
    constructor() {
        super(
            "pushkart",
            "Толкает тележку на 3-17 футов.",
            undefined,
            undefined,
            undefined,
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
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

            return await this.fail(msg, `Вы должны подождать 30 секунд, прежде чем снова толкать тележку (${secondsRemaining} осталось).`);
        } else if (pushResult == "CAP") {
            return await this.fail(msg, "Вы набрали максимальное количество баллов за сегодня. Возвращайтесь завтра!");
        }

        server.addCartFeet(feetPushed);

        await Promise.all([
            user.save(),
            server.save()
        ]);

        await this.respond(msg, `<:payload:656955124098269186> Толкнул тележку вперед на **${feetPushed}** футов (всего ${server.server.fun!.payloadFeetPushed}).`);

        return true;
    }
}
