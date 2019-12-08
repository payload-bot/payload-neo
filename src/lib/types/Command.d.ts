import { Client } from "../../client";
import { Message, Channel } from "discord.js";

export interface Command {
    name: string;
    description: string;
    usage: string;
    permissions: Array<string>;
    canBeExecutedBy: Array<string>;
    zones: Array<Channel["type"]>;
    requiresRoot?: boolean;

    run: (client: Client, msg: Message) => void;
}