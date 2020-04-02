import * as Discord from "discord.js"
import { readdir } from "fs";
import config from "./config";
import { CommandConstructor } from "./lib/exec/Command";
import { Client } from "./lib/types";
import mongoose from "mongoose";
import { ScheduledScript } from "./lib/types/ScheduledScripts";
import { listen } from "./api"
import UserManager from "./lib/manager/UserManager";
import ServerManager from "./lib/manager/ServerManager";
import { AutoResponseConstructor } from "./lib/exec/Autoresponse";

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

/* 
    Connect to MongoDB. Will exit if no database was found.
*/
mongoose.connect(config.MONGODB_URI, {
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
    if (err) return console.error(err);

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
    if (err) throw new Error("Error reading schedule directory: " + err);

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
    if (err) throw new Error("Error reading commands directory: " + err);

    console.log("Loading commands...");

    files.forEach(folder => {
        const commandInit: CommandConstructor = require(__dirname + "/preload/commands/" + folder).default;
        let command = new commandInit();

        if (!command.name) return console.warn("\t" + folder + " is not a valid command module.");

        client.commands.set(command.name, command);

        console.log("\tLoaded " + command.name);
    });
});

/**
 * Load auto commands.
 */
readdir(__dirname + "/preload/auto", (err, files) => {
    if (err) throw new Error("Error reading automatic responses directory: " + err);

    console.log("Loading autoresponses...");

    files.forEach(file => {
        const autoInit: AutoResponseConstructor = require(__dirname + "/preload/auto/" + file).default;
        let autoresponse = new autoInit();

        if (!autoresponse.name) return console.warn("\tFile " + file + " is not a valid autoresponse module.");

        client.autoResponses.set(autoresponse.name, autoresponse);

        console.log("\tLoaded " + autoresponse.name);
    });
});

client.login(config.TOKEN);
listen(4201, client);