import {
  ApplicationCommandRegistries,
  container,
  RegisterBehavior,
  SapphireClient,
} from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#utils/clientOptions.ts";
import { AutoResponseStore } from "./structs/AutoResponse/AutoResponseStore.ts";
import connect from "#utils/database.ts";
import { join } from "node:path";
import { serveApi } from "../api/mod.ts";
import { serveMetrics } from "../api/metrics-api.ts";

export class PayloadClient extends SapphireClient {
  public dev = process.env["NODE_ENV"] !== "production";

  constructor() {
    super(CLIENT_OPTIONS);
    this.stores.register(
      new AutoResponseStore().registerPath(join(import.meta.dirname!, "..", "..", "auto")),
    );
  }

  public override async login(token?: string) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

    connect();

    const server = serveApi();
    const metricServer = serveMetrics();
    container.api = server;
    container.metrics = metricServer;

    const response = await super.login(token);

    return response;
  }

  public override async destroy() {
    const apiClosePromise = new Promise((resolve, _) =>
      container.api?.close(() => {
        container.logger.debug("Gracefully cleaned up api server");
        resolve(true);
      }),
    );
    const metricsClosePromise = new Promise((resolve, _) =>
      container.metrics?.close(() => {
        container.logger.debug("Gracefully cleaned up metrics server");
        resolve(true);
      }),
    );

    await Promise.allSettled([apiClosePromise, metricsClosePromise, super.destroy()]);
  }
}
