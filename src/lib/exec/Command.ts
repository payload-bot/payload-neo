import * as Discord from "discord.js";
import config from "../../config";
import { Client } from "../types/Client";
import { Message } from "discord.js";
import { getArgs } from "../../util/parse";


declare interface NumberArgument {
    name: string;
    description: string;
    required: boolean;

    type: "number";
    min?: number;
    max?: number;
    options?: number[];
};
declare interface StringArgument {
    name: string;
    description: string;
    required: boolean;

    type: "string";
    minLength?: number;
    maxLength?: number;
    options?: string[];
};
declare interface BooleanArgument {
    name: string;
    description: string;
    required: boolean;

    type: "boolean";
    options?: boolean[]; // never gonna use this lol
}
declare type Argument = NumberArgument | StringArgument | BooleanArgument;

export abstract class Command {
    name: string;
    description: string;
    args: Argument[];
    permissions: Array<Discord.PermissionString>;
    canBeExecutedBy: Array<Discord.PermissionString>;
    zones: Discord.Channel["type"][];
    requiresRoot: boolean;
    subCommands: {
        [name: string]: Command
    };
    commandLadder: string[];

    constructor(
        name: string,
        description: string,
        args?: Argument[],
        permissions?: Array<Discord.PermissionString>,
        canBeExecutedBy?: Array<Discord.PermissionString>,
        zones?: Array<Discord.Channel["type"]>,
        requiresRoot?: boolean,
        subCommands?: { [name: string]: Command },
        commandLadder?: Array<string>
    ) {
        this.name = name;
        this.description = description;
        this.args = args || [];
        this.permissions = permissions || ["SEND_MESSAGES"];
        this.canBeExecutedBy = canBeExecutedBy || ["SEND_MESSAGES"];
        this.zones = zones || ["text", "dm"];
        this.requiresRoot = requiresRoot || false;
        this.subCommands = subCommands || {};
        this.commandLadder = commandLadder || [];
    }

    private argToString(arg: Argument): string {
        let innerText = arg.name;

        if (arg.options) {
            innerText = arg.options.join("|");
        }

        if (arg.required) {
            return `<${innerText}>`;
        } else {
            return `[${innerText}]`;
        }
    }

    private convertArgsToUsageString(): string {
        const readableArgs = this.args.map(this.argToString);

        return readableArgs.join(" ");
    }

    getFullCommandName() {
        if (this.commandLadder.length > 0) {
            return `${this.commandLadder.join(" ")} ${this.name}`;
        }

        return this.name;
    }

    getArgs(message: Message, commandLevel?: number): Array<string> {
        return getArgs(
            message.content.slice(
                config.PREFIX.length + this.name.length
            ).trim()
        ).slice(commandLevel || 0);
    }

    async parseArgs(message: Message, commandLevel?: number): Promise<Array<number | string | boolean> | false> {
        const args = this.getArgs(message, commandLevel);
        let parsedArgs: Array<number | string | boolean> = [];

        for (let i = 0; i < this.args.length; i++) {
            if (!args[i]) {
                if (this.args[i].required) {
                    return await this.fail(message, `Missing \`${this.args[i].name}\` argument. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                break;
            }

            if (this.args[i].type == "number") {
                const argCheck = this.args[i] as NumberArgument;
                let arg: String | number = args[i];

                if (Number(arg) === NaN || Number(arg) === null || Number(arg) === Infinity) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be a number. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                arg = Math.round(Number(arg));

                if (argCheck.max != undefined && argCheck.max < arg) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be less than ${argCheck.max + 1}. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                } else if (argCheck.min != undefined && argCheck.min > arg) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be greater than ${argCheck.min - 1}. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                if (argCheck.options && !argCheck.options.includes(arg)) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be one of the following: ${argCheck.options.join(", ")}. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                parsedArgs.push(arg);
            } else if (this.args[i].type == "string") {
                const argCheck = this.args[i] as StringArgument;
                let arg: any = args[i];

                if (argCheck.maxLength != undefined && argCheck.maxLength < arg.length) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must have less than ${argCheck.maxLength + 1} characters. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                } else if (argCheck.minLength != undefined && argCheck.minLength > arg.length) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must have more than ${argCheck.minLength - 1} characters. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                if (argCheck.options && !argCheck.options.includes(arg)) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be one of the following: ${argCheck.options.join(", ")}. Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                parsedArgs.push(arg);
            } else if (this.args[i].type == "boolean") {
                const argCheck = this.args[i] as NumberArgument;
                let arg: String | boolean = args[i];

                if (!["true", "false"]) {
                    return await this.fail(message, `\`${argCheck.name}\` argument must be either "true" or "false". Type \`${config.PREFIX}help ${this.getFullCommandName()}\` to learn more.`);
                }

                arg = arg == "true" ? true : false;

                parsedArgs.push(arg);
            }
        }

        return parsedArgs;
    }

    getUsage(): string {
        return `${config.PREFIX}${this.getFullCommandName()} ${this.convertArgsToUsageString()}`;
    }

    getSubcommandArray(): string[] {
        return Object.keys(this.subCommands);
    }

    async respond(message: Message, response: string): Promise<Message> {
        return await message.channel.send(response) as Message;
    }

    async fail(message: Message, reason: string): Promise<false> {
        await message.channel.send(reason);
        return false;
    }

    async flash(messagePromise: Promise<Message>, durationMS?: number): Promise<void> {
        return new Promise(async resolve => {
            const message = await messagePromise;

            setTimeout(async () => {
                if (message.deletable) {
                    await message.delete();
                }

                resolve();
            }, durationMS || 5000);
        });
    }

    async runSub(subCommandName: string, client: Client, msg: Message): Promise<boolean> {
        return await this.subCommands[subCommandName].run(client, msg);
    }

    abstract async run(client: Client, msg: Message): Promise<boolean>;
}

export interface CommandConstructor {
    new(): Command;
}