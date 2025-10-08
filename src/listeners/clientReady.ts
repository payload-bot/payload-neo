import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, type ListenerOptions, Piece, Store } from "@sapphire/framework";
import { blue, brightMagenta, gray, green, magenta, white, yellow } from "@std/fmt/colors";
import type { TFunction } from "@sapphire/plugin-i18next";

@ApplyOptions<ListenerOptions>({
  once: true,
})
export class ReadyEvent extends Listener<typeof Events.ClientReady> {
  private readonly DEV = this.container.client.dev;
  private readonly style = this.DEV ? yellow : blue;

  override run() {
    this.printBanner();
    this.printStoreDebugInformation();
  }

  private printBanner() {
    const success = green("+");

    const llc = this.DEV ? brightMagenta : white;
    const blc = this.DEV ? magenta : blue;

    const line01 = llc("");
    const line02 = llc("");
    const line03 = llc("");

    // Offset Pad
    const pad = " ".repeat(7);

    console.log(
      String.raw`
${line01} ${pad}${blc(`Payload Version ${Deno.env.get("VERSION") ?? "DEV"}`)}
${line02} ${pad}[${success}] Gateway
${line02} ${pad}[${success}] SQL
${line02} ${pad}[${success}] API
${line03}${` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc(this.DEV ? "DEVELOPMENT" : "PRODUCTION")}`}
		`.trim(),
    );
  }

  private printStoreDebugInformation() {
    const { client, logger, i18n } = this.container;
    const stores = [...client.stores.values()];

    for (const store of stores) {
      logger.info(this.styleStore(store));
    }

    logger.info(this.styleLanguages(i18n.languages));
  }

  private styleStore(store: Store<Piece>) {
    return gray(
      `${"├─"} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${store.name}.`,
    );
  }

  private styleLanguages(languages: Map<string, TFunction>) {
    return gray(
      `└─ Loaded ${this.style(languages.size.toString().padEnd(3, " "))} languages.`,
    );
  }
}
