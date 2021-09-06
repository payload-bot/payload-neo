import connectMongo from "#/lib/utils/connectMongo";
import { ApplyOptions } from "@sapphire/decorators";
import { ListenerOptions, Events, Listener } from "@sapphire/framework";
import { blue, gray, green, magenta, magentaBright, white, yellow } from "colorette";

const dev = process.env.NODE_ENV !== "production";

@ApplyOptions<ListenerOptions>({
    once: true,
})
export class ReadyEvent extends Listener<typeof Events.ClientReady> {
    private readonly style = dev ? yellow : blue;

    async run() {
        const { client } = this.container;
        await connectMongo(client);

        this.printBanner();
        this.printStoreDebugInformation();
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
${line01} ${pad}${blc("5.0.0")}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc(dev ? "DEVELOPMENT" : "PRODUCTION")}` : ""}
		`.trim()
        );
    }

    private printStoreDebugInformation() {
        const { client, logger } = this.container;
        const stores = [...client.stores.values()];
        const last = stores.pop()!;

        for (const store of stores) logger.info(this.styleStore(store, false));
        logger.info(this.styleStore(last, true));
    }

    private styleStore(store: any, last: boolean) {
        return gray(
            `${last ? "└─" : "├─"} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${
                store.name
            }.`
        );
    }
}
