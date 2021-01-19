import { User, UserModel } from "../model/User";
import * as Discord from "discord.js";
import SteamID from "steamid";
import { add, isAfter } from "date-fns";

export default class UserManager {
    discordClient: Discord.Client;
    users: Map<string, UserEditable>;

    constructor(client: Discord.Client) {
        this.discordClient = client;
        this.users = new Map();
    } 

    async getUser(discordID: string) {
        return this.users.get(discordID) || this.ensureUser(discordID);
    }

    async ensureUser(discordID: string) {
        let user: UserModel | null;
        user = await User.findOne({ id: discordID });

        if (!user) {
            user = new User({
                id: discordID
            });
        }

        let userEditable = new UserEditable(user);
        this.users.set(discordID, userEditable);

        return userEditable;
    }
}

export class UserEditable {
    user: UserModel;

    constructor(model: UserModel) {
        this.user = model;
    }

    static createSteamID(id: string): SteamID | null {
        let steamID = new SteamID(id);

        if (!steamID.isValid()) return null;

        return steamID;
    }

    setSteamID(steamID: SteamID): UserEditable {
        this.user.steamID = steamID.getSteamID64();

        return this;
    }

    setNotificationsLevel(level: NotificationsLevel): UserEditable {
        this.user.notificationsLevel = level;

        return this;
    }

    getFeetPushed(): number {
        this.user.fun = this.user.fun || {
            payload: {
                feetPushed: 0,
                pushing: false,
                lastPushed: 0,
                pushedToday: 0,
                lastActiveDate: (new Date()).getDate()
            }
        };

        this.user.fun.payload = this.user.fun.payload || {
            feetPushed: 0,
            pushing: false,
            lastPushed: 0,
            pushedToday: 0,
            lastActiveDate: (new Date()).getDate()
        };

        return this.user.fun.payload.feetPushed || 0;
    }

    feetPushedTransaction(amount: number) {
        this.user.fun = this.user.fun || {
            payload: {
                feetPushed: 0,
                pushing: false,
                lastPushed: 0,
                pushedToday: 0,
                lastActiveDate: (new Date()).getDate()
            }
        };

        this.user.fun.payload = this.user.fun.payload || {
            feetPushed: 0,
            pushing: false,
            lastPushed: 0,
            pushedToday: 0,
            lastActiveDate: (new Date()).getDate()
        };

        this.user.fun.payload.feetPushed = this.user.fun.payload.feetPushed || 0;

        this.user.fun.payload.feetPushed += amount;
    }

    addCartFeet(feet: number): "SUCCESS" | "COOLDOWN" | "CAP" {
        this.user.fun = this.user.fun || {
            payload: {
                feetPushed: 0,
                pushing: false,
                lastPushed: 0,
                pushedToday: 0,
                lastActiveDate: Date.now()
            }
        };

        this.user.fun.payload = this.user.fun.payload || {
            feetPushed: 0,
            pushing: false,
            lastPushed: 0,
            pushedToday: 0,
            lastActiveDate: Date.now()
        };

        this.user.fun.payload.feetPushed = this.user.fun.payload.feetPushed || 0;
        this.user.fun.payload.pushedToday = this.user.fun.payload.pushedToday || 0;

        const lastPushed = this.user.fun.payload.lastPushed;
        const lastActivePush = this.user.fun.payload.lastActiveDate;
        const pushedToday = this.user.fun.payload.pushedToday;

        const isUnderCooldown = isAfter(add(lastPushed, { seconds: 5 }), Date.now())
        const hasReachedMaxPoints = pushedToday >= 175;
        const shouldRefreshCap = isAfter(Date.now(), add(lastActivePush, { days: 1 }))

        if (isUnderCooldown) return "COOLDOWN";
        else if (hasReachedMaxPoints) {
            if (shouldRefreshCap) this.user.fun.payload.pushedToday = 0;
            else return "CAP";
        }

        this.user.fun.payload.feetPushed += feet;
        this.user.fun.payload.pushedToday += feet;
        this.user.fun.payload.lastPushed = Date.now();
        this.user.fun.payload.lastActiveDate = Date.now();

        return "SUCCESS";
    }

    setProp(property: string, val: any) {
        const propertyChain = property.split(".");

        let currentProp: any = this.user;
        for (let i = 0; i < propertyChain.length; i++) {
            if (!currentProp[propertyChain[i]]) currentProp[propertyChain[i]] = {};
            else currentProp = currentProp[propertyChain[i]];
        }

        currentProp = val;
    }

    async refresh() {
        this.user = (await User.findOne({ id: this.user.id })) as UserModel;

        return this;
    }

    async save() {
        return await this.user.save();
    }
}

export enum NotificationsLevel {
    NONE,
    MAJOR,
    ALL
}