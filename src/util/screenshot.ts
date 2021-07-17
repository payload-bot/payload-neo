import {
  launch as launchBrowser,
  Page,
  SerializableOrJSHandle,
  Browser,
} from "puppeteer";

type ElementBasedBound = {
  selector: string;
  edge: "top" | "bottom" | "left" | "right";
};
interface CaptureOptions {
  [index: string]:
    | string
    | number
    | Array<string>
    | ElementBasedBound
    | undefined;

  waitFor?: string | Array<string>;
  top: number | ElementBasedBound;
  bottom?: number | ElementBasedBound;
  left: number | ElementBasedBound;
  right?: number | ElementBasedBound;
  cssPath?: string;
}

export async function generateClipBounds(
  options: SerializableOrJSHandle,
  page: Page
) {
  return await page.evaluate((options) => {
    let bounds = {
      x: 0,
      y: 0,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    };

    ["top", "left", "bottom", "right"].forEach((edge) => {
      const currentOption = options[edge];
      if (!currentOption) return;

      if (typeof currentOption == "number") {
        if (edge == "top") bounds.y = currentOption;
        if (edge == "left") bounds.x = currentOption;
        if (edge == "bottom") bounds.height = currentOption - bounds.y;
        if (edge == "right") bounds.width = currentOption - bounds.x;
      } else if (typeof currentOption == "object") {
        if (!document.querySelector(currentOption.selector))
          throw new Error("Top element not found.");

        const element = document.querySelector(currentOption.selector);
        const boundingClientRect = element.getBoundingClientRect();

        if (edge == "top") bounds.y = boundingClientRect[currentOption.edge];
        if (edge == "left") bounds.x = boundingClientRect[currentOption.edge];
        if (edge == "bottom")
          bounds.height = boundingClientRect[currentOption.edge] - bounds.y;
        if (edge == "right")
          bounds.width = boundingClientRect[currentOption.edge] - bounds.x;
      }
    });

    return bounds;
  }, options);
}

async function createPage(url: string) {
  const browser = await launchBrowser({
    // testing purposes
    // headless: false,
    // args: ['--proxy-server="direct://"', '--proxy-bypass-list=*'],
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: {
      // Needed or else screenshots can't be created
      height: 925,
      width: 1000,
    },
  });

  const page = await browser.newPage();
  await page.goto(url);

  return { page, browser };
}

async function closeBrowser(browser: Browser) {
  await Promise.all(
    (await browser.pages()).map(async (page) => await page.close())
  );
  await browser.close();
}

export async function capture(
  url: string,
  options: CaptureOptions = { left: 0, top: 0 }
): Promise<Buffer> {
  const { page, browser } = await createPage(url);

  if (options.cssPath) await page.addStyleTag({ path: options.cssPath });

  if (options.waitFor) {
    if (Array.isArray(options.waitFor)) {
      await Promise.all(
        options.waitFor.map((selector) => page.waitForSelector(selector))
      );
    } else {
      await page.waitForSelector(options.waitFor);
    }
  }

  const clip = await generateClipBounds(options, page);

  const screenshotBuffer = await page.screenshot({
    clip,
  });

  await closeBrowser(browser);

  return screenshotBuffer as Buffer;
}
