import client from "./client";
import config from "./config";
import { listen } from "./api"

client.login(config.TOKEN);
listen(8880, client);