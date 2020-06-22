import express from "express"
import { Client } from "../lib/types"
import { version } from "../util/version_control"
import rglApi from "./routes/rgl"
import etf2lApi from "./routes/etf2l"
import steamid from "../util/steamid"
import rcon from "./routes/rcon"
import bodyParser from "body-parser"

export async function listen(port: number, client: Client): Promise<void> {
    const server = express();
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: false }))
    server.set('json spaces', 1)

    server.get("/commands", (req: any, res: any) => {
        res.json({
            count: client.commands.filter(command => !command.requiresRoot).size,
            data: client.commands.filter(command => !command.requiresRoot).array()
        });
    });

    server.get("/autoresponses", (req: any, res: any) => {
        res.json({
            count: client.autoResponses.size,
            data: client.autoResponses.array()
        });
    });

    server.get("/stats", (req: any, res: any) => {
        res.json({
            users: client.users.cache.size,
            servers: client.guilds.cache.size,
            uptime: client.uptime
        });
    });

    server.get('/rgl/:id', (req: any, res: any) => {
        rglApi(req, res)
    });

    server.post('/rcon', async (req, res) => {
        const rconRes = await rcon(req, res)
        res.json(rconRes)
    })

    // server.get('/etf2l/:id', (req: any, res: any) => {
    //     etf2lApi(req, res)
    // })

    server.get('/steam/:id', (req: any, res: any) => {
        const id = steamid(req.params.id)
        if (typeof id === 'string') res.json({ id })
    })

    server.get("/all-data", (req: any, res: any) => {
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
                users: client.users.cache.size,
                servers: client.guilds.cache.size,
                uptime: client.uptime,
                version: version
            }
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
}