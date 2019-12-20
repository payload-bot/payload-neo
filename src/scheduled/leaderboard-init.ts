import { Client } from "../lib/types"
import { Bot as BotDoc, BotModel } from "../lib/types/Bot";
import { run as runLeaderboardUpdate } from "./leaderboard";

export const every = -1;

export async function run(client: Client) {
    let botDoc: BotModel | null = await BotDoc.findOne({
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