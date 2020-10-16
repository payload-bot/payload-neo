import express, { Request, Response } from "express"
import { Client } from "../lib/types"
import { version } from "../util/version_control"
import rglApi from "./routes/rgl"
import steamid from "../util/steamid"
import rcon from "./routes/rcon"
import cors from "cors"

export async function listen(port: number, client: Client): Promise<void> {
    const server = express();

    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.set('json spaces', 1);
    server.use(cors());

    server.get("/commands", (req: Request, res: Response) => {
        res.json({
            count: client.commands.filter(command => !command.requiresRoot).size,
            data: client.commands.filter(command => !command.requiresRoot).array()
        });
    });

    server.get("/autoresponses", (req: Request, res: Response) => {
        res.json({
            count: client.autoResponses.size,
            data: client.autoResponses.array()
        });
    });

    server.get("/stats", (req: Request, res: Response) => {
        res.json({
            users: client.users.cache.size,
            servers: client.guilds.cache.size,
            uptime: client.uptime,
            version: version
        });
    });

    server.use("/rgl/:id", rglApi);

    server.post('/rcon', async (req, res) => {
        const rconRes = await rcon(req, res)
        res.json(rconRes)
    })

    server.get('/steam/:id', (req: Request, res: Response) => {
        const id = steamid(req.params.id)
        if (typeof id === 'string') res.json({ id })
    })

    server.get("/all-data", (req: Request, res: Response) => {
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