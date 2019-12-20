import { Client } from "../lib/types"
import { User, UserModel } from "../lib/manager";
import { Bot as BotDoc, BotModel } from "../lib/types/Bot";
import { qSort } from "../util/sort";

export const every = 1000 * 60 * 5;

export async function run(client: Client) {
    let sortedUsers: UserModel[] = await User.find({
        "fun.payload.feetPushed": {
            $exists: true
        }
    });/*.sort({
        "fun.payload.feetPushed": -1
    });*/

    let leaderboard = qSort(sortedUsers.map(user => {
        return {
            id: user.id,
            pushed: user.fun!.payload.feetPushed
        };
    }), (userA, userB) => {
        return userB.pushed - userA.pushed;
    });

    client.leaderboard = {
        users: leaderboard,
        updated: new Date()
    };

    let botDoc: BotModel | null = await BotDoc.findOne({
        id: 0
    });

    botDoc = botDoc || new BotDoc({
        id: 0,
        leaderboard: {
            pushcart: {
                users: leaderboard,
                updated: client.leaderboard.updated
            }
        },
    });

    botDoc.leaderboard!.pushcart = {
        users: leaderboard,
        updated: client.leaderboard.updated
    }

    await botDoc.save();

    console.log("Updated leaderboard.");
}