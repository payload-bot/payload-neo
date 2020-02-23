import express from "express";
import { Client } from "../lib/types";
import { version } from "../util/version_control";

export async function listen(port: number, client: Client): Promise<void> {
    const server = express();

    server.get("/commands", (req, res) => {
        res.json({
            count: client.commands.filter(command => !command.requiresRoot).size,
            data: client.commands.filter(command => !command.requiresRoot).array()
        });
    });

    server.get("/autoresponses", (req, res) => {
        res.json({
            count: client.autoResponses.size,
            data: client.autoResponses.array()
        });
    });

    server.get("/stats", (req, res) => {
        res.json({
            users: client.users.size,
            servers: client.guilds.size,
            uptime: client.uptime
        });
    });

    server.get("/all-data", (req, res) => {
        res.json({
            commands: {
                count: client.commands.filter(command => !command.requiresRoot).size,
                data: client.commands.filter(command => !command.requiresRoot).array()
            },
            autoResponses: {
                count: client.autoResponses.size,
                data: client.autoResponses.array()
            },
            stats: {
                users: client.users.size,
                servers: client.guilds.size,
                uptime: client.uptime,
                version: version
            }
        });
    });

    server.get("/", (req, res) => {
        res.redirect('/all-data');
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
}