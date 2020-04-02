import * as Discord from "discord.js";
import mongoose from "mongoose";
import { pushNotification } from "../util/push-notification";
import { getChangelog } from "../util/get-changelog";
import { version } from "../util/version_control";
import config from "../config";
import { Client as ClientDocument, ClientModel } from "../lib/model/Client";

module.exports = {
    run: async (client) => {
        console.log(`Logged in as ${client.user.tag}, on ${client.guilds.cache.size} guilds, serving ${client.users.cache.size} users`);
        client.user.setActivity(`payload.tf/invite | v${version}`);

        let waitingInterval: NodeJS.Timeout;
        waitingInterval = setInterval(async () => {
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

                if (!changelog) {
                    client.emit("warn", "Error fetching changelog.");
                    return console.warn("Error fetching changelog!");
                }

                let botDoc: ClientModel = await ClientDocument.findOne({ id: 0 });

                if (botDoc && botDoc.startupVersion && botDoc.startupVersion == version) return console.log("No new version.");

                try {
                    const channel = await client.channels.cache.get(config.info.logChannel) as Discord.TextChannel;
                    if (channel) channel.send("```md\n" + changelog + "\n```");
                } catch (error) {
                    console.log("Could not find channel.");
                }

                for (let i = 0; i < guilds.length; i++) {
                    let notif = await pushNotification(client, guilds[i].ownerID, 2, new Discord.MessageEmbed({
                        title: `${client.user.username} updated to v${version}!`,
                        description: `A new update has been released to ${client.user.username}!\nTo opt-out of these update notifications, type \`${config.PREFIX}config notifications 1\` in DM's.`,
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
                if (!botDoc) return console.log("No bot db entry!");

                botDoc.startupVersion = version;

                await botDoc.save();
            } else {
                console.log("Waiting for MongoDB connection...");
            }
        }, 1000);
    }
}