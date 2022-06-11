import { ApplyOptions } from "@sapphire/decorators";
import {
  ListenerOptions,
  Events,
  Listener,
  Piece,
  Store,
} from "@sapphire/framework";
import {
  blue,
  gray,
  green,
  magenta,
  magentaBright,
  white,
  yellow,
} from "colorette";
import connectMongo from "#utils/connectMongo";
import type { TFunction } from "@sapphire/plugin-i18next";

const dev = process.env.NODE_ENV !== "production";

@ApplyOptions<ListenerOptions>({
  once: true,
})
export class ReadyEvent extends Listener<typeof Events.ClientReady> {
  private readonly style = dev ? yellow : blue;

  async run() {
    const { client } = this.container;

    this.printBanner();
    this.printStoreDebugInformation();

    await connectMongo(client);
  }

  private printBanner() {
    const success = green("+");

    const llc = dev ? magentaBright : white;
    const blc = dev ? magenta : blue;

    const line01 = llc("");
    const line02 = llc("");
    const line03 = llc("");

    // Offset Pad
    const pad = " ".repeat(7);

    console.log(
      String.raw`
${line01} ${pad}${blc(`Payload Version ${process.env.VERSION ?? "DEV"}`)}
${line02} ${pad}[${success}] Gateway
${line02} ${pad}[${success}] MongoDB
${line02} ${pad}[${success}] API
${line03}${` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc(
        dev ? "DEVELOPMENT" : "PRODUCTION"
      )}`}
		`.trim()
    );
  }

  private printStoreDebugInformation() {
    const { client, logger, i18n } = this.container;
    const stores = [...client.stores.values()];

    for (const store of stores) logger.info(this.styleStore(store));

    logger.info(this.styleLanguages(i18n.languages));
  }

  private styleStore(store: Store<Piece>) {
    return gray(
      `${"├─"} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${
        store.name
      }.`
    );
  }

  private styleLanguages(languages: Map<string, TFunction>) {
    return gray(
      `└─ Loaded ${this.style(
        languages.size.toString().padEnd(3, " ")
      )} languages.`
    );
  }
}
