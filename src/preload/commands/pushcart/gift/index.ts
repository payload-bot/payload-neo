import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";

export default class Gift extends Command {
    constructor() {
        super(
            "gift",
            "Gifts <amount> points to a user.",
            [
                {
                    name: "user mention",
                    description: "The user to gift points to.",
                    required: true,
                    type: "string"
                },
                {
                    name: "amount",
                    description: "The amount of points to gift.",
                    required: true,
                    type: "number",
                    min: 20
                }
            ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["pushcart"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg, 2);

        if (args === false) {
            return false;
        }

        const amount = args[1] as number;
        const targetUser = msg.mentions.users.first();

        if (!targetUser) {
            return await this.fail(msg, `Invalid \`<user mention>\` argument. Type \`pls help ${this.getFullCommandName()}\` to learn more.`);
        }

        const from = await client.userManager.getUser(msg.author.id);
        const to = await client.userManager.getUser(targetUser.id);

        if (from.getFeetPushed() < amount) {
            return await this.fail(msg, `Too many points specified. The most you can gift is ${from.getFeetPushed()}.`);
        }

        from.feetPushedTransaction(-1 * amount);
        to.feetPushedTransaction(amount);

        await Promise.all([
            from.save(),
            to.save()
        ]);

        await this.respond(msg, `🎁 ${msg.author.tag} has gifted **${amount}** points to ${targetUser.tag}!`);

        return true;
    }
}