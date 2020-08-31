import { Client } from "../../client";
import { Message, Channel, PermissionString } from "discord.js";

export interface Command {
    name: string;
    description: string;
    usage: string;
    permissions: Array<PermissionString>;
    canBeExecutedBy: Array<PermissionString>;
    zones: Array<Channel["type"]>;
    requiresRoot?: boolean;

    run: (client: Client, msg: Message) => void;
}