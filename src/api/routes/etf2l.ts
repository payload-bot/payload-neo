import got from "got";
import getSteam64 from "../../util/steamid"

/**
 * GET /api/etf2l/:id
 * -> http://api.etf2l.org/player/:id
 */
export default async (req, res) => {
    const id64 = getSteam64(req.params.id)
    
    if (id64 === "INVALID" || id64 === "ERROR") return res.json({ "error": 400, message: "Could not get SteamID" })

    const etf2lApiPath = `http://api.etf2l.org/player/${id64}`
    let playerProfile = await got(etf2lApiPath, {
        json: true
    });

    playerProfile = playerProfile.body;
    const { player: { teams } } = playerProfile as any
    const competition = teams.map(team => team.competitions);
    const seasons = competition.map(comp => comp)
    res.json({ seasons })
}