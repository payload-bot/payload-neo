import { Client } from "../lib/types"
import { Client as BotDoc, ClientModel } from "../lib/model/Client";
import { run as runLeaderboardUpdate } from "./leaderboard";

export const every = -1;

export async function run(client: Client) {
    let botDoc: ClientModel | null = await BotDoc.findOne({
        id: 0
    });

    if (!botDoc || !botDoc.leaderboard) return;

    client.leaderboard = {
        users: botDoc.leaderboard.pushcart.users,
        updated: botDoc.leaderboard.pushcart.updated
    };

    runLeaderboardUpdate(client);

    console.log("Pulled leaderboard from db.");
}