import { Request, Response, NextFunction } from "express";
import client from "../..";

export default async function checkBeta(req: Request, res: Response, next: NextFunction) {
    try {
        const payloadDiscordGuild =
            client.guilds.cache.get(process.env.PAYLOAD_DISCORD_ID) ??
            (await client.guilds.fetch(process.env.PAYLOAD_DISCORD_ID));

        const isUserInServer = await payloadDiscordGuild.members.fetch(req.user.id);

        if (!isUserInServer)
            return res.status(403).json({
                status: 403,
                message: "Not a beta user",
            });

        return next();
    } catch (ex) {
        return res.status(403).json({
            status: 403,
            message: "Not a beta user",
        });
    }
}
