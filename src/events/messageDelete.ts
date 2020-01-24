import { handleMessageDelete, cleanCache } from "../util/snipe-cache";

module.exports = {
    run: async (client, msg) => {
        handleMessageDelete(client, msg);
        cleanCache(client, msg);
    }
}