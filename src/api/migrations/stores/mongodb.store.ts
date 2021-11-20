import type { Connection } from "mongoose";
import type { MigrationStore } from "../migration.store";

export class MongoDbStore implements MigrationStore {
  constructor(private connection: Connection) {}

  async load(callback: any) {
    const data = await this.connection.db.collection("migrations").findOne({});
    return callback(null, data ?? {});
  }

  async save(data: any, callback: any) {
    const result = await this.connection.db.collection("migrations").updateOne(
      {},
      {
        $set: {
          lastRun: data.lastRun,
          migrations: data.migrations,
        },
      },
      {
        upsert: true,
      }
    );

    return callback(null, result);
  }
}
