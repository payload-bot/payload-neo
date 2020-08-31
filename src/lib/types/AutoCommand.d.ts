import { Client } from "./Client";
import { Message, Channel, PermissionString } from "discord.js";

export interface AutoResponse {
    name: string;
    description: string;
    pattern: RegExp;
    permissions: Array<PermissionString>;
    zones: Array<Channel["type"]>;

    run: (client: Client, msg: Message) => Promise<void>;
}