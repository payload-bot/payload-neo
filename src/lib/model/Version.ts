import { query } from "../../util/database";

export default async function getStartVersion(): Promise<string | undefined> {
    let rows = await query('SELECT * FROM version');
    if (!rows.length) return undefined;
    return rows[0].startVersion;
}

export async function saveVersion(version: string): Promise<void> {
    let rows = await query('SELECT * FROM version');
    if(!rows.length) await query(`INSERT INTO version(startVersion) VALUES ('${version}')`);
    await query(`UPDATE version SET startVersion = '${version}' WHERE 1`);
    return console.log(`Set startVersion to ${version}.`);
}