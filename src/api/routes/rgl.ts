import got from "got";
import cheerio from "cheerio";
import s from "../helpers/selectors";

import getSteam64 from "../../util/steamid"
import { Request, Response } from "express";

/**
 * GET /api/rgl/:id
 * -> http://rgl.gg/Public/PlayerProfile.aspx?p=:id
 */
export default async (req: Request, res: Response) => {
    const id64 = getSteam64(req.params.id);

    if (id64 === "INVALID" || id64 === "ERROR") return res.status(400).json({ success: "false", message: "Could not get SteamID" });

    const rglUrl = `http://rgl.gg/Public/PlayerProfile.aspx?p=${id64}`;

    const rglPlayerProfile = await got.get(rglUrl);
    const body = rglPlayerProfile.body;

    const $ = cheerio.load(body);

    const isRglApproved = $(s.player.isAccount).text().trim()
    if (isRglApproved.length > 1) return res.status(200).json({
        steamid: id64,
        success: "true",
        message: isRglApproved
    })

    const trophiesRaw = $(s.player.trophies).text().split(/\s+/);

    const name = $(s.player.name).text();
    const verified = $(s.player.verified).length === 1;
    const probation = $(s.player.probation).length === 1;
    const banned = $(s.player.banned).length === 1;
    const avatar = $(s.player.avatar).attr().src

    const totalEarnings = $(s.player.totalEarnings).text() || "$0";
    const trophies = {
        gold: trophiesRaw[0] || 0,
        silver: trophiesRaw[1] || 0,
        bronze: trophiesRaw[2] || 0
    };
    const experience = [];

    $(s.player.leagueHeading).each((i, heading) => {
        /**
         * Category - RGL - Format
         */
        const $h = $(heading);
        const hText = $h.text();
        const hTextParts = hText.split(" - ");

        const category = hTextParts[0].toLowerCase();
        const format = hTextParts[2].toLowerCase();

        const $t = $h.parent().nextAll(s.player.leagueTable._).first();

        const seasons = $t.find(s.player.leagueTable.season).map((i, elem) => $(elem).text().trim()) as unknown as string;
        const divs = $t.find(s.player.leagueTable.div).map((i, elem) => $(elem).text().trim()) as unknown as string;
        const teams = $t.find(s.player.leagueTable.team).map((i, elem) => $(elem).text().trim());
        const endRanks = $t.find(s.player.leagueTable.endRank).map((i, elem) => $(elem).text().trim());
        const recordsWith = $t.find(s.player.leagueTable.recordWith).map((i, elem) => $(elem).text().trim());
        const recordsWithout = $t.find(s.player.leagueTable.recordWithout).map((i, elem) => $(elem).text().trim());
        const amountsWon = $t.find(s.player.leagueTable.amountWon).map((i, elem) => $(elem).text().trim());
        const joined = $t.find(s.player.leagueTable.joined).map((i, elem) => $(elem).text().trim());
        const left = $t.find(s.player.leagueTable.left).map((i, elem) => $(elem).text().trim()) as unknown as string;

        for (let i = 0; i < seasons.length; i++) {
            experience.push(
                {
                    category,
                    format,
                    season: seasons[i].toLowerCase(),
                    div: divs[i].toLowerCase(),
                    team: teams[i],
                    endRank: endRanks[i],
                    recordWith: recordsWith[i],
                    recordWithout: recordsWithout[i],
                    amountWon: amountsWon[i],
                    joined: joined[i],
                    left: left[i],
                    isCurrentTeam: left[i] === ""
                }
            );
        }
    });

    res.status(200).json({
        steamid: id64,
        avatar,
        name,
        bans: {
            banned,
            probation,
            verified
        },
        totalEarnings,
        trophies,
        experience,
    });
};