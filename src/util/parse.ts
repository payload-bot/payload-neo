import config from "../config";
import { Message } from "discord.js";

export function sliceCmd(message: Message, name: string): string {
    return message.content.slice(config.PREFIX.length + name.length).trim();
}

export function getArgs(str: string): Array<string> {
    let rawArgs = str.replace(/\s+(?=((\\[\\"]|[^\\"])*"(\\[\\"]|[^\\"])*")*(\\[\\"]|[^\\"])*$)/g, "%SPLIT%").split("%SPLIT%");

    // <Array>.map(): void[] ?????? wtf
    let safeArgs = rawArgs.map(arg => {
        return arg.replace(/^"(.+)"$/, "$1").replace(/\\(.)/g, "$1");
    }) as Array<unknown>;

    return safeArgs as Array<string>;
}