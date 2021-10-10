import type { SapphireClient } from "@sapphire/framework";
import { connect } from "mongoose";

// Default to localhost
process.env.MONGO_URI ??= "mongodb://localhost:27017/payload";

console.log(process.env.MONGO_URI);

export default async function connectMongo(client: SapphireClient) {
  try {
    await connect(process.env.MONGO_URI!);
    client.logger.info("Successfully connected to MongoDB.");
  } catch (err) {
    client.logger.error("Failed to connect to MongoDB. Check your password!");
    client.destroy();
    process.exit(1);
  }
}
