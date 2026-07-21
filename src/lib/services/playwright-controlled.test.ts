import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

describe("Chromium controlado", () => {
  it("renderiza una página aislada y captura su viewport", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        acceptDownloads: false,
        serviceWorkers: "block",
        viewport: { width: 390, height: 844 },
      });
      try {
        const page = await context.newPage();
        await page.setContent("<main><h1>Fixture seguro</h1></main>");
        expect(await page.locator("h1").textContent()).toBe("Fixture seguro");
        expect((await page.screenshot()).byteLength).toBeGreaterThan(100);
      } finally {
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }, 30_000);
});
