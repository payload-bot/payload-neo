import client from "./client";
import config from "./config";
import { listen } from "./api"

client.login(config.TOKEN);
listen(80, client);
