import express, { Request, Response } from "express";
import { User, UserModel } from "../lib/model/User";
import DiscordStrategy from "passport-discord";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import client from "..";
import config from "../config";
import { Server } from "../lib/model/Server";
import cookieParser from "cookie-parser";
import AuthedUser, { AuthedUserProfile, AuthedUserServer } from "../lib/types/DiscordAuth";
require("dotenv").config();

// ROUTES
import ExternalRoutes from "./routes/external/external-handler";
import InternalRoutes from "./routes/internal/internal-handler";
import LoginRoutes from "./routes/login/login-route-handler";

export async function listen(port: number): Promise<void> {
	const server = express();

	server.use(cookieParser());
	server.use(express.json());
	server.use(express.urlencoded({ extended: false }));
	server.use(cors({ credentials: true, origin: "http://localhost:3000" }));
	server.use(helmet());
	server.use(cookieParser());
	server.use(passport.initialize());

	passport.serializeUser((user, done) => {
		done(null, user);
	});
	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

	passport.use(
		new DiscordStrategy(
			{
				clientID: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				callbackURL: process.env.REDIRECT_URL,
				scope: ["identify", "guilds"]
			},
			async (_accessToken, _refreshToken, profile, cb) => {
				let user: UserModel;
				try {
					user = await User.findOne({ id: profile.id });
				} catch (err) {
					const newUser = new User({
						id: profile.id
					});

					await newUser.save();

					user = newUser;
				}

				const { guilds, ...userProfile }: AuthedUserProfile = {
					avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
					fullName: `${profile.username}#${profile.discriminator}`,
					isAdmin: config.allowedID === profile.id,
					...profile
				};

				const returnObject: AuthedUser = {
					user,
					profile: userProfile,
					access_token: _accessToken,
					refresh_token: _refreshToken
				};

				cb(null, returnObject);
			}
		)
	);

	server.use("/external/", ExternalRoutes);
	server.use("/internal/", InternalRoutes);
	server.use("/auth/", LoginRoutes);

	server.all("*", (req: Request, res: Response) => {
		res.status(404).json({ message: `Cannot find ${req.method} route for ${req.path}` });
	});

	return new Promise(resolve => {
		server.listen(port, resolve);
	});
}
