import express, { Request, Response } from "express";
import cors from "cors";
import cookie from "cookie-parser";
import passport from "passport";
import helmet from "helmet";
import refresh from "passport-oauth2-refresh";
import createDiscordStrategy from "./createDiscordStrat";

// ROUTES
import AuthRoutes, { DiscordAuthRoutes } from "./controllers/auth";
import StatRoutes from "./controllers/stats";
import UserRoutes from "./controllers/users";
import GuildRoutes from "./controllers/guilds";

export async function listen(port: number): Promise<void> {
    const server = express();

    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.set("json spaces", 1);
    server.use(
        cors({
            origin: process.env.CLIENT_URL,
        })
    );
    server.use(helmet());
    server.use(cookie());
    server.use(passport.initialize());

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj as any);
    });

    const discordStrategy = createDiscordStrategy();
    passport.use(discordStrategy);
    refresh.use("discord", discordStrategy);

    server.use(
        "/api/internal/public/",
        (req, res, next) => {
            // Deprecate this route and notify people
            res.setHeader("Warning", '299 - "Deprecated"');
            next();
        },
        StatRoutes
    );
    server.use("/api/stats", StatRoutes);
    server.use("/api/auth/discord", DiscordAuthRoutes);
    server.use("/api/auth", AuthRoutes);
    server.use("/api/users", UserRoutes);
    server.use("/api/guilds", GuildRoutes);

    server.all("*", (req: Request, res: Response) => {
        res.status(404).json({
            status: 404,
            error: "Not found",
            message: `Cannot find ${req.method} route for ${req.path}`,
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
}
