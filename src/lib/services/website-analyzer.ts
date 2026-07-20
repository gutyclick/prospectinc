import "server-only";

import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

import { countBrokenInternalLinks, safeFetchHtml } from "./safe-fetch";
import { sameRegistrableHost, validatePublicUrl } from "./safe-web-url";
import { extractWebsiteFacts, type WebsiteFacts } from "./website-extractor";

export type WebsiteAnalysis = {
  initialUrl: string;
  finalUrl: string;
  httpStatus: number;
  facts: WebsiteFacts & {
    websiteExists: boolean;
    websiteReachable: boolean;
    socialOnly: boolean;
  };
  brokenLinksCount: number;
  desktopScreenshot: Buffer | null;
  mobileScreenshot: Buffer | null;
};

async function protectPage(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    try {
      await validatePublicUrl(request.url());
      if (["media", "font"].includes(request.resourceType()))
        return route.abort("blockedbyclient");
      return route.continue();
    } catch {
      return route.abort("blockedbyclient");
    }
  });
  page.on("download", (download) => void download.cancel());
}

async function closeQuietly(resource: Browser | BrowserContext | Page | null) {
  await resource?.close().catch(() => undefined);
}

export async function analyzeWebsite(
  input: string,
  options: {
    signal?: AbortSignal;
    timeoutMs?: number;
    launchBrowser?: typeof chromium.launch;
  } = {},
): Promise<WebsiteAnalysis> {
  const timeoutMs = Math.min(
    Math.max(options.timeoutMs ?? 60_000, 10_000),
    120_000,
  );
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);
  const fetched = await safeFetchHtml(input, {
    signal,
    timeoutMs: Math.min(timeoutMs, 20_000),
  });
  let facts = extractWebsiteFacts(fetched.html, fetched.finalUrl);
  if (facts.contactPageUrl) {
    const contactUrl = await validatePublicUrl(facts.contactPageUrl);
    if (
      contactUrl.href !== fetched.finalUrl &&
      sameRegistrableHost(contactUrl, new URL(fetched.finalUrl))
    ) {
      try {
        const contactPage = await safeFetchHtml(contactUrl.href, {
          signal,
          timeoutMs: Math.min(timeoutMs, 10_000),
        });
        const contactFacts = extractWebsiteFacts(
          contactPage.html,
          contactPage.finalUrl,
        );
        facts = {
          ...facts,
          hasContactForm: facts.hasContactForm || contactFacts.hasContactForm,
          hasWhatsapp: facts.hasWhatsapp || contactFacts.hasWhatsapp,
          hasBooking: facts.hasBooking || contactFacts.hasBooking,
          socialLinks: [...new Set([...facts.socialLinks, ...contactFacts.socialLinks])],
          contacts: [...facts.contacts, ...contactFacts.contacts].filter(
            (contact, index, all) =>
              all.findIndex(
                (item) =>
                  item.type === contact.type &&
                  item.normalizedValue === contact.normalizedValue,
              ) === index,
          ),
        };
      } catch {
        // La página principal sigue siendo una auditoría válida si contacto falla.
      }
    }
  }
  const brokenLinksCount = await countBrokenInternalLinks(
    fetched.html,
    fetched.finalUrl,
    signal,
  );
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let desktopScreenshot: Buffer | null = null;
  let mobileScreenshot: Buffer | null = null;
  try {
    browser = await (options.launchBrowser ?? chromium.launch)({
      headless: true,
      args: ["--disable-extensions", "--disable-dev-shm-usage"],
    });
    context = await browser.newContext({
      acceptDownloads: false,
      viewport: { width: 1440, height: 900 },
      serviceWorkers: "block",
    });
    page = await context.newPage();
    await protectPage(page);
    await page.goto(fetched.finalUrl, {
      waitUntil: facts.requiresBrowser ? "networkidle" : "domcontentloaded",
      timeout: Math.min(timeoutMs, 30_000),
    });
    const finalUrl = (await validatePublicUrl(page.url())).href;
    const renderedHtml = await page.content();
    if (facts.requiresBrowser)
      facts = extractWebsiteFacts(renderedHtml, finalUrl);
    desktopScreenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      animations: "disabled",
    });
    if (!facts.hasMobileViewport) {
      await page.setViewportSize({ width: 390, height: 844 });
      mobileScreenshot = await page.screenshot({
        type: "png",
        fullPage: false,
        animations: "disabled",
      });
    }
    return {
      initialUrl: fetched.initialUrl,
      finalUrl,
      httpStatus: fetched.status,
      facts: {
        ...facts,
        websiteExists: true,
        websiteReachable: fetched.status < 500,
        socialOnly: false,
      },
      brokenLinksCount,
      desktopScreenshot,
      mobileScreenshot,
    };
  } finally {
    await closeQuietly(page);
    await closeQuietly(context);
    await closeQuietly(browser);
  }
}
