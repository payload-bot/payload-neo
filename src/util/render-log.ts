import { capture } from "./screenshot";
import config from "../config";

export async function render(link: string): Promise<Buffer> {
    return await capture(link, {
        top: {
            selector: "#log-header",
            edge: "top",
        },
        left: {
            selector: "#log-header",
            edge: "left",
        },
        right: {
            selector: "#log-header",
            edge: "right",
        },
        bottom: {
            selector: "#log-section-players",
            edge: "bottom",
        },

        cssPath: config.files.LOGS_CSS,
    });
}
