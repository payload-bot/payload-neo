import { Client } from "../lib/types";
import getStartElement from "../util/startup";
import config from "../config";

export const every = 1000 * 60 * 30; // 15 mins

export async function run(client: Client) {
    client.user.setActivity(`${getStartElement} | v${config.info.version}`);
}