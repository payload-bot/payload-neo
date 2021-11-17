import type { SapphireClient } from "@sapphire/framework";
import { connect } from "mongoose";

export default async function connectMongo(client: SapphireClient) {
  try {
    await connect(process.env.MONGO_URI!, {
      connectTimeoutMS: 5000,
      dbName: "payload",
    });
  } catch (err) {
    client.logger.fatal("Failed to connect to MongoDB. Check your password!");
    client.logger.fatal(err);
    client.destroy();
    process.exit(1);
  }
}
