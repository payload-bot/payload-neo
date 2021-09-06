import type { SapphireClient } from "@sapphire/framework";
import { connect } from "mongoose";

export default async function connectMongo(client: SapphireClient) {
  try {
    await connect(process.env.MONGO_URI as string);
    client.logger.info("Successfully connected to MongoDB.");
  } catch (err) {
    client.logger.error("Failed to connect to MongoDB. Check your password!");
    client.destroy();
    process.exit(1);
  }
}
