import {
  connect,
  Page,
  Browser,
  type LaunchOptions,
  type BrowserConnectOptions,
  type BrowserLaunchArgumentOptions,
  type ElementHandle,
} from "puppeteer";

import puppeteer from "puppeteer";
import { envParseBoolean, envParseString } from "@skyra/env-utilities";

const ENVIRONMENT = process.env.NODE_ENV;
const WS_URL = envParseString("CHROME_WS_URL", "");
const ENABLE_WS = envParseBoolean("CHROME_WS_ENABLE", false);

if (typeof ENVIRONMENT !== "string") {
  throw new Error("NODE_ENV variable is not set");
}

type ElementBasedBound = {
  selector: string;
  edge: "top" | "bottom" | "left" | "right";
};

type PuppeteerLaunchOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions;

interface CaptureOptions {
  [index: string]: string | number | Array<string> | ElementBasedBound | undefined;

  waitFor?: string | Array<string>;
  top: number | ElementBasedBound;
  bottom?: number | ElementBasedBound;
  left: number | ElementBasedBound;
  right?: number | ElementBasedBound;
  cssPath?: string;
}

let browser: Browser = null;

async function createBrowser() {
  browser ??= await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  return browser;
}

export async function generateClipBounds(options: ElementHandle, page: Page) {
  return await page.evaluate(options => {
    let bounds = {
      x: 0,
      y: 0,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    };

    (["top", "left", "bottom", "right"] as const).forEach(edge => {
      const currentOption = (options as any)[edge];
      if (!currentOption) return;

      if (typeof currentOption == "number") {
        if (edge == "top") bounds.y = currentOption;
        if (edge == "left") bounds.x = currentOption;
        if (edge == "bottom") bounds.height = currentOption - bounds.y;
        if (edge == "right") bounds.width = currentOption - bounds.x;
      } else if (typeof currentOption == "object") {
        if (!document.querySelector(currentOption.selector)) throw new Error("Top element not found.");

        const element = document.querySelector(currentOption.selector);
        const boundingClientRect = element.getBoundingClientRect();

        if (edge === "top") bounds.y = boundingClientRect[currentOption.edge];
        if (edge === "left") bounds.x = boundingClientRect[currentOption.edge];
        if (edge === "bottom") bounds.height = boundingClientRect[currentOption.edge] - bounds.y;
        if (edge === "right") bounds.width = boundingClientRect[currentOption.edge] - bounds.x;
      }
    });

    return bounds;
  }, options);
}

export async function createOrConnectChrome(options?: PuppeteerLaunchOptions) {
  if (ENABLE_WS && ENVIRONMENT === "production" && WS_URL.length > 0) {
    return await connect({ browserWSEndpoint: WS_URL });
  }

  return await createBrowser();
}

async function createPage(url: string, options?: PuppeteerLaunchOptions) {
  const browser = await createOrConnectChrome(options);

  const page = await browser.newPage();
  await page.goto(url);

  return page;
}

export async function capturePage(
  url: string,
  options: CaptureOptions = { left: 0, top: 0 },
  puppeteerOptions?: PuppeteerLaunchOptions,
): Promise<Buffer> {
  const page = await createPage(url, puppeteerOptions);

  try {
    if (options.cssPath) await page.addStyleTag({ path: options.cssPath });

    if (options.waitFor) {
      if (Array.isArray(options.waitFor)) {
        await Promise.all(options.waitFor.map(selector => page.waitForSelector(selector)));
      } else {
        await page.waitForSelector(options.waitFor);
      }
    }

    const clip = await generateClipBounds(options as any, page);

    const screenshotBuffer = await page.screenshot({
      clip,
      type: "webp",
    });

    return screenshotBuffer as Buffer;
  } finally {
    page.close();
  }
}

export async function captureSelector(url: string, selector: string, options?: PuppeteerLaunchOptions) {
  const page = await createPage(url, options);

  try {
    await page.goto(url);

    const element = await page.waitForSelector(selector);

    const screenshot = await element.screenshot({ type: "webp" });

    return screenshot;
  } finally {
    page.close();
  }
}
