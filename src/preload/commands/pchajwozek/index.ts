import { Command } from "../../../lib/Executables/Command";
import { Bot } from "../../../types/Bot";
import { Message } from "discord.js";
import { weightedRandom } from "../../../utils/random";

export default class PushCart extends Command {
    constructor() {
        super(
            "pchajwozek",
            "Popycha wózek o 3-17 stóp.",
            undefined,
            undefined,
            undefined,
            ["text"]
        );
    }

    async run(bot: Bot, msg: Message): Promise<boolean> {
        const user = await bot.userManager.getUser(msg.author.id);
        const server = await bot.serverManager.getServer(msg.guild.id);

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

	   return await this.fail(msg, `Musisz poczekać 30 sekund zanim będziesz mógł popchać wózek ponownie (pozostało ${secondsRemaining} sekund).`) 
        } else if (pushResult == "CAP") {
        return await this.fail(msg, "Dopchałeś już najdalej ile możesz dzisiaj. Wróć jutro, by dopchać wózek dalej.");
	}

        server.addCartFeet(feetPushed);

        await Promise.all([
            user.save(),
            server.save()
        ]);

	await this.respond(msg, `<:payload:656955124098269186> Dopchałeś wózek o **${feetPushed}** stóp (${server.server.fun!.payloadFeetPushed} łącznie).`);
        return true;
    }
}
