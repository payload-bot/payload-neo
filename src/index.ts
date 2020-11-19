import * as Discord from "discord.js"
import { readdir } from "fs";
import { CommandConstructor } from "./lib/exec/Command";
import { Client } from "./lib/types";
import mongoose from "mongoose";
import { ScheduledScript } from "./lib/types/ScheduledScripts";
import { listen } from "./api/index"
import UserManager from "./lib/manager/UserManager";
import ServerManager from "./lib/manager/ServerManager";
import { AutoResponseConstructor } from "./lib/exec/Autoresponse";
require("dotenv").config();

const client: Client = new Discord.Client() as Client;
client.autoResponses = new Discord.Collection();
client.commands = new Discord.Collection();
client.scheduled = [];

client.userManager = new UserManager(client);
client.serverManager = new ServerManager(client);

client.cache = {
    snipe: {},
    pings: {}
};

const restrictedCommands = process.env.DISABLED_COMMANDS ? process.env.DISABLED_COMMANDS.split(", ") : []

/* 
    Connect to MongoDB. Will exit if no database was found.
*/
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to MongoDB.");
}).catch(() => {
    console.error("Error connecting to MongoDB. Make sure you used the correct password.");
    process.exit(1);
});

/*
    Event loader.
*/
readdir(__dirname + '/events/', (err, files) => {
    if (err) throw new Error("No events found; cannot continue without an event!");

    console.log("Loading events...");

    files.forEach((file) => {
        const eventFunction = require(`./events/${file}`);
        const event = eventFunction.event || file.split('.')[0];
        const emitter = (typeof eventFunction.emitter === 'string' ? client[eventFunction.emitter] : eventFunction.emitter) || client;
        const { once } = eventFunction;
        try {
            emitter[once ? 'once' : 'on'](event, (...args) => eventFunction.run(client, ...args));
        }
        catch (error) {
            console.error(error.stack);
        }
        console.log("\tLoaded " + file);
    });
});

/**
* Load scheduled scripts.
*/
readdir(__dirname + "/scheduled", (err, files) => {
    if (err) throw new Error("Error reading schedule directory:\n" + err);

    console.log("Loading scheduled scripts...");

    files.forEach(file => {
        let script: ScheduledScript = require(__dirname + "/scheduled/" + file);

        client.scheduled.push(script);

        console.log("\tLoaded " + file);
    });
});

/**
 * Load commands.
 */
readdir(__dirname + "/preload/commands", (err, files) => {
    if (err) throw new Error("Error reading commands directory:\n" + err);

    console.log("Loading commands...");

    files.forEach(folder => {
        const commandInit: CommandConstructor = require(__dirname + "/preload/commands/" + folder).default;
        let command = new commandInit();

        if (!command.name) return console.warn("\t" + folder + " is not a valid command module.");

        if (restrictedCommands.includes(command.name)) return console.warn("\t" + folder + " was not loaded due to command restriction.");

        client.commands.set(command.name, command);

        console.log("\tLoaded " + command.name);
    });
});

/**
 * Load auto commands.
 */
readdir(__dirname + "/preload/auto", (err, files) => {
    if (err) throw new Error("Error reading automatic responses directory:\n" + err);

    console.log("Loading autoresponses...");

    files.forEach(file => {
        const autoInit: AutoResponseConstructor = require(__dirname + "/preload/auto/" + file).default;
        let autoresponse = new autoInit();

        if (!autoresponse.name) return console.warn("\tFile " + file + " is not a valid autoresponse module.");

        if (restrictedCommands.includes(autoresponse.name)) return console.warn("\t" + file + " was not loaded due to command restriction.");

        client.autoResponses.set(autoresponse.name, autoresponse);

        console.log("\tLoaded " + autoresponse.name);
    });
});

const apiPort = Number(process.env.API_PORT) || 3001

client.login(process.env.TOKEN);
listen(apiPort);

export default client;