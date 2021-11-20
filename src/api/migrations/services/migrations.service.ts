import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
// @ts-expect-error
import { MigrationStore } from "../migration.store";
// @ts-expect-error
import { load } from "migrate";
import { resolve as pathResolve } from "path";
import { getRootData } from "@sapphire/pieces";
import { MongoDbStore } from "../stores/mongodb.store";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class MigrationsService implements OnApplicationBootstrap {
  private logger = new Logger(MigrationsService.name);

  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async onApplicationBootstrap() {
    this.connection.once("connected", this.runMigrations.bind(this));
  }

  private async runMigrations() {
    this.logger.log("Running migrations...");

    return new Promise<void>((resolve, reject) => {
      load(
        {
          stateStore: new MongoDbStore(this.connection),
          migrationsDirectory: pathResolve(getRootData().root, "../migrations"),
        },
        (error: any, set: any) => {
          if (error) {
            return reject(error);
          }

          set.up((error: any) => {
            if (error) {
              return reject(error);
            }

            this.logger.log("Migrations run successfully!");
            resolve();
          });
        }
      );
    });
  }
}
