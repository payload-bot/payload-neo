import puppeteer, { ScreenshotOptions, JSONObject } from "puppeteer";

type ElementBasedBound = {
    selector: string,
    edge: "top" | "bottom" | "left" | "right"
};
interface CaptureOptions {
    [index: string]: string | number | Array<string> | ElementBasedBound | undefined;

    waitFor?: string | Array<string>;
    top: number | ElementBasedBound;
    bottom?: number | ElementBasedBound;
    left: number | ElementBasedBound;
    right?: number | ElementBasedBound;
    cssPath?: string;
};

export async function capture(url: string, options: CaptureOptions = {left: 0, top: 0}): Promise<Buffer> {
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });
    const page = await browser.newPage();
    await page.goto(url);

    if (options.cssPath) await page.addStyleTag({ path: options.cssPath });

    if (options.waitFor) {
        if (Array.isArray(options.waitFor)) {
            await Promise.all(options.waitFor.map(selector => page.waitForSelector(selector)));
        } else {
            await page.waitForSelector(options.waitFor);
        }
    }
    let clipBounds: {
        x: number,
        y: number,
        width?: number,
        height?: number
    } = await page.evaluate((options: CaptureOptions) => {
        let bounds: {[k: string]: number | undefined} = {
            x: 0,
            y: 0,
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
        ["top", "left", "bottom", "right"].forEach(edge => {
            let currentOption = options[edge];
            if (!currentOption) return;

            if (typeof currentOption == "number") {
                if (edge == "top") bounds.y = currentOption;
                if (edge == "left") bounds.x = currentOption;
                if (edge == "bottom") bounds.height = currentOption - (bounds.y as number);
                if (edge == "right") bounds.width = currentOption - (bounds.x as number);
            } else if (typeof currentOption == "object") {
                if (!document.querySelector((currentOption as ElementBasedBound).selector)) throw new Error("Top element not found.");
    
                let element = document.querySelector((currentOption as ElementBasedBound).selector) as HTMLElement;
                let boundingClientRect = element.getBoundingClientRect();

                if (edge == "top") bounds.y = boundingClientRect[(currentOption as ElementBasedBound).edge];
                if (edge == "left") bounds.x = boundingClientRect[(currentOption as ElementBasedBound).edge];
                if (edge == "bottom") bounds.height = boundingClientRect[(currentOption as ElementBasedBound).edge] - (bounds.y as number);
                if (edge == "right") bounds.width = boundingClientRect[(currentOption as ElementBasedBound).edge] - (bounds.x as number);
            }
        });

        return bounds;
    }, options as JSONObject) as {
        x: number,
        y: number,
        width?: number,
        height?: number
    };
    let screenshotBuffer = await page.screenshot({
        clip: (clipBounds as ScreenshotOptions["clip"]),
        encoding: "binary"
    });
    browser.close();
    return screenshotBuffer;
}

/**
 * Takes a screenshot of an element. Will wait 30 seconds for the element to load before timing out.
 * @param url The URL to take the screenshot in.
 * @param selector The element selector.
 * @param viewport The default viewport dimensions.
 */
export async function captureSelector(url: string, selector: string, viewport = {width: 1920, height: 1080}): Promise<Buffer> {
    const browser = await puppeteer.launch({
        defaultViewport: viewport
    });

    const page = await browser.newPage();
    await page.goto(url);

    let pageElement = await page.waitForSelector(selector);

    let screenshotBuffer = await pageElement.screenshot({
        encoding: "binary"
    });

    await browser.close();

    return screenshotBuffer;
}