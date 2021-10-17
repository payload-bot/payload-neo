import mongoose from "mongoose";

export type ClientModel = mongoose.Document & {
    id?: 0,

    startupVersion?: string
};

const ClientSchema = new mongoose.Schema({
    id: Number,

    startupVersion: String
});

export const Client = mongoose.model("Client", ClientSchema);