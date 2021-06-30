import { TextChannel, MessageEmbed } from "discord.js";
import mongoose from "mongoose";
import { NotificationLevel, pushNotification } from "../util/push-notification";
import { getChangelog } from "../util/get-changelog";
import { version } from "../util/version_control";
import config from "../config";
import { Client as ClientDocument, ClientModel } from "../lib/model/Client";
import { Client } from "../lib/types";

module.exports = {
    once: true,
    run: async (client: Client) => {
        client.logger.info(`Logged in as ${client.user.tag}, on ${client.guilds.cache.size} guilds, serving ${client.users.cache.size} users`)
        await client.user.setActivity(`payload.tf/invite | v${version}`);

        const waitingInterval: NodeJS.Timeout = setInterval(async () => {
            if (mongoose.connection.readyState === 1) {
                clearInterval(waitingInterval);

                // Run scheduled scripts
                for (let i = 0; i < client.scheduled.length; i++) {
                    let script = client.scheduled[i];

                    if (script.every < 0) script.run(client);
                    else setInterval(() => script.run(client), script.every);
                }

                let guilds = client.guilds.cache.array();

                let changelog = getChangelog(version);

                client.emit("event", "STARTED");

                if (!changelog) {
                    return client.logger.warn("Error fetching changelog!");
                }

                let botDoc: ClientModel = await ClientDocument.findOne({ id: 0 });

                if (botDoc && botDoc.startupVersion && botDoc.startupVersion == version) return client.logger.verbose("No new version.");

                const channel = client.channels.cache.get(config.logging.releaseChannel) as TextChannel;
                if (channel) channel.send("```md\n" + changelog + "\n```");

                for (let i = 0; i < guilds.length; i++) {
                    let notif = await pushNotification(client, guilds[i].ownerID, NotificationLevel.ALL, new MessageEmbed({
                        title: `${client.user.username} updated to v${version}!`,
                        description: `A new update has been released to ${client.user.username}!\nTo opt-out of these update notifications, type \`${config.PREFIX}config notifications ${NotificationLevel.NONE}\` in DM's.`,
                        fields: [
                            {
                                name: "Changelog",
                                value: `\`\`\`md\n${changelog}\n\`\`\``
                            }
                        ],
                        footer: {
                            text: `Want more of ${client.user.username}? Join the discord! ${config.PREFIX}info for the link.`
                        }
                    }), version);
                    console.log(`Notification: ${guilds[i].ownerID} | ${notif} | ${i + 1} of ${guilds.length}`);
                }
                if (!botDoc) {
                    botDoc = new ClientDocument({
                        id: 0,
                        startupVersion: version
                    })
                } else {
                    botDoc.startupVersion = version;
                }

                await botDoc.save();
            } else {
                client.logger.info("Waiting for MongoDB connection...");
            }
        }, 1000);
    }
}