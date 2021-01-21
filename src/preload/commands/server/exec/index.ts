import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import Language from "../../../../lib/types/Language";
import axios from "axios";
import PayloadColors from "../../../../lib/misc/colors";

export default class Exec extends Command {
	constructor() {
		super(
			"exec",
			"**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**\n\nExecutes a command on one of your servers.",
			[
				{
					name: "name",
					description: "The name of the server to execute the command in.",
					required: true,
					type: "string"
				},
				{
					name: "command",
					description: "The command to execute.",
					required: true,
					type: "string"
				}
			],
			undefined,
			undefined,
			["dm"],
			undefined,
			undefined,
			["server"]
		);
	}

	async run(client: Client, msg: Message): Promise<boolean> {
		const args = await this.parseArgs(msg, 2);
		const lang: Language = await this.getLanguage(msg);

		if (args === false) {
			return false;
		}

		const user = await client.userManager.getUser(msg.author.id);

		const targetServer = args[0];
		const command = args[1];

		if (!targetServer) {
			return await this.fail(msg, lang.server_noname);
		} else if (!command) {
			return await this.fail(msg, lang.server_nocommand);
		}

		if (!user.user.servers) {
			return await this.fail(
				msg,
				lang.server_noservers.replace("%prefix", await this.getPrefix(msg))
			);
		}

		const server = user.user.servers.find(server => server.name == targetServer);

		if (!server) {
			return await this.fail(
				msg,
				lang.server_targetinvalid.replace("%target", targetServer.toString())
			);
		}

		const rconEmbed = new MessageEmbed();
		try {
			const { data: { body } } = await axios.post("https://rcon.tf/api/execute", {
				ip: server.address,
				port: 27015,
				password: server.rconPassword,
				command: `say [PAYLOAD] Command sent by ${msg.author.tag}.; ${command}`
			});

			rconEmbed.setTitle(lang.server_embedtitle);
			rconEmbed.setColor(PayloadColors.USER);
			rconEmbed.setAuthor(msg.author.tag, msg.author.avatarURL());
			rconEmbed.setDescription(
				body.length > 1500
					? lang.server_embeddesc.replace("%response", body).slice(0, 1450) + "..."
					: lang.server_embeddesc.replace("%response", body)
			);
		} catch (err) {
			rconEmbed.setTitle(lang.server_errorsending);
			rconEmbed.setColor(PayloadColors.ADMIN);
			rconEmbed.setAuthor(msg.author.tag, msg.author.avatarURL());
			rconEmbed.setDescription(lang.server_errorsending);
		}

		await msg.channel.send(rconEmbed);
		return true;
	}
}
