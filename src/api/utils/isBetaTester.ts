import client from "../..";

const PAYLOAD_DISCORD_ID = process.env.PAYLOAD_DISCORD_ID;

async function fetchDiscord() {
    return (
        client.guilds.cache.get(PAYLOAD_DISCORD_ID) ??
        (await client.guilds.fetch(PAYLOAD_DISCORD_ID))
    );
}

async function fetchUser(discordId: string) {
    const discord = await fetchDiscord();
    return discord.members.cache.get(discordId) ?? (await discord.members.fetch(discordId));
}

export async function isBetaTester(discordId: string) {
    try {
        const userInDiscord = await fetchUser(discordId);

        if (!userInDiscord) return false;

        const userHasBetaRole = userInDiscord.roles?.cache?.find(r => r.name === "Beta Tester");

        if (!userHasBetaRole) return false;

        return true;
    } catch (ex) {
        return false;
    }
}

export async function isInPayloadDiscord(discordId: string) {
    try {
        const isUserInServer = fetchUser(discordId);

        if (!isUserInServer) return false;

        return true;
    } catch (ex) {
        return false;
    }
}
