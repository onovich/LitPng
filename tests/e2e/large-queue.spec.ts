import { expect, test } from "@playwright/test";
import { transparentFixturePng } from "../helpers/imageFixtures";

function fixtures(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    name: `image-${index}.png`, mimeType: "image/png", buffer: transparentFixturePng(16, 16)
  }));
}

test("a worker failure marks one file failed and the next file uses a fresh worker", async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    let failNext = true;
    window.Worker = class extends OriginalWorker {
      postMessage(message: unknown) {
        if (failNext) {
          failNext = false;
          this.dispatchEvent(new Event("error"));
        } else {
          super.postMessage(message);
        }
      }
    };
  });
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Add images").setInputFiles(fixtures(2));
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.locator(".fileRow .status.failed")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Run batch" })).toBeEnabled();
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(2);
});

test("125-image queue uses bounded decoding, pagination, and explicit result cleanup", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const stats = { active: 0, max: 0 };
    (window as typeof window & { metadataStats: typeof stats }).metadataStats = stats;
    const original = window.createImageBitmap;
    window.createImageBitmap = function (...args) {
      stats.active += 1;
      stats.max = Math.max(stats.max, stats.active);
      return Reflect.apply(original, window, args).finally(() => { stats.active -= 1; });
    };
  });
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Add images").setInputFiles(fixtures(125));
  await expect(page.locator(".fileRow")).toHaveCount(50);
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator(".fileRow")).toHaveCount(50);
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator(".fileRow")).toHaveCount(25);
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("progressbar", { name: "Batch progress" })).toHaveAttribute("value", "125", { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Run batch" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(25);
  expect(await page.evaluate(() => (window as typeof window & { metadataStats: { max: number } }).metadataStats.max)).toBe(1);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("region", { name: "Batch progress" }).screenshot({ path: testInfo.outputPath(`queue-${width}.png`) });
  }
  await page.getByRole("button", { name: "Remove completed" }).click();
  await expect(page.locator(".fileRow")).toHaveCount(0);
  await expect(page.getByTitle("Download ZIP")).toBeDisabled();
});

for (const action of ["resume", "stop"] as const) {
  test(`paused queue can ${action} without losing completed results`, async ({ page }, testInfo) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route(/\.wasm(?:\?|$)/, async (route) => { await gate; await route.continue(); });
    await page.goto("/jpg-compressor/");
    await page.getByLabel("Add images").setInputFiles(fixtures(3));
    await page.getByRole("button", { name: "Run batch" }).click();
    await page.getByRole("button", { name: "Pause queue" }).click();
    await expect(page.getByLabel("Max width")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Clear queue" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add images", exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole("progressbar", { name: "Batch progress" })).toHaveAttribute("value", "1");
    await expect(page.locator(".fileRow .status.queued")).toHaveCount(2);
    if (action === "resume") {
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByRole("region", { name: "Batch progress" }).screenshot({ path: testInfo.outputPath(`paused-${width}.png`) });
      }
    }
    if (action === "resume") {
      await page.getByRole("button", { name: "Resume queue" }).click();
    } else {
      await page.getByRole("button", { name: "Stop after current image" }).click();
      await expect(page.locator(".fileRow .status.cancelled")).toHaveCount(2);
      await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(1);
      await page.getByRole("button", { name: "Run batch" }).click();
    }
    await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Run batch" })).toBeEnabled();
  });
}
