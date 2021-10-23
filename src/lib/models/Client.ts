import mongoose from "mongoose";

export type ClientModel = mongoose.Document & {
    id: 0,

    leaderboard: {
        pushcart: {
            users: Array<{ id: string, pushed: number }>,
            updated: Date
        }
    },
};

const ClientSchema = new mongoose.Schema({
    id: Number,

    leaderboard: {
        pushcart: {
            users: [{
                id: String,
                pushed: Number
            }],
            updated: Date
        }
    },
});

export const Client = mongoose.model<ClientModel>("Client", ClientSchema);