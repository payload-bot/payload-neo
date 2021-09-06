import { ApplyOptions } from '@sapphire/decorators';
import { Command, Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { Server } from '#/lib/models/Server';

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends Precondition {
	public run(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
		return message.guild ? this.runGuild(message, command, context) : this.runDM(command, context);
	}

	private runDM(command: Command, context: Precondition.Context): Precondition.Result {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
	}

	private async runGuild(msg: Message, command: Command, context: Precondition.Context) {
		const server = await Server.findOne({ id: msg.guildId as string }).lean().exec();

        if (server!.commandRestrictions!.find(restriction => restriction.channelID === msg.channelId && restriction.commands.includes(command.name))) {
            return this.error({ context: { ...context, silent: true } });
        }
		
		return this.runDM(command, context);
	}
}