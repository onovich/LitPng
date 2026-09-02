import { expect, test, type Page } from "@playwright/test";
import { HISTORY_STORAGE_KEY } from "../../apps/web/src/lib/batchHistory";
import { settingsForPreset } from "../../apps/web/src/lib/types";
import { transparentFixturePng } from "../helpers/imageFixtures";

async function runBatch(page: Page) {
  await page.getByLabel("Add images").setInputFiles({
    name: "private-image.png", mimeType: "image/png", buffer: transparentFixturePng()
  });
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();
}

test("history is opt-in and restores only settings across reloads", async ({ page }) => {
  await page.goto("/jpg-compressor/");
  const history = page.getByRole("region", { name: "Batch history" });
  await expect(page.getByLabel("Remember future batches in this browser")).not.toBeChecked();
  await runBatch(page);
  expect(await page.evaluate((key) => localStorage.getItem(key), HISTORY_STORAGE_KEY)).toBeNull();
  await page.getByRole("button", { name: "Clear queue" }).click();
  await page.getByLabel("Remember future batches in this browser").check();
  await page.getByLabel("Max width").fill("100");
  await runBatch(page);
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(history.getByRole("listitem")).toContainText("1 done · 0 failed");
  const raw = await page.evaluate((key) => localStorage.getItem(key), HISTORY_STORAGE_KEY);
  expect(raw).not.toContain("private-image");
  expect(raw).not.toContain("blob");

  // Clicking Run with only completed jobs must not append the same batch again.
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await page.reload();
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByLabel("Max width")).toHaveValue("0");
  await history.getByRole("button", { name: "Reuse settings" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Max width")).toHaveValue("100");
  await expect(page.getByRole("button", { name: "Download image" })).toHaveCount(0);
  await history.getByRole("button", { name: "Delete record" }).click();
  await expect(history.getByRole("listitem")).toHaveCount(0);
  await expect(history.getByRole("heading")).toBeFocused();
  await page.reload();
  await expect(history.getByRole("listitem")).toHaveCount(0);
});

test("malformed history and blocked storage do not break image processing", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "{invalid");
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Blocked", "QuotaExceededError");
      original.call(this, name, value);
    };
  }, HISTORY_STORAGE_KEY);
  await page.goto("/png-compressor/");
  await page.getByLabel("Remember future batches in this browser").click();
  await expect(page.getByLabel("Remember future batches in this browser")).not.toBeChecked();
  await expect(page.getByRole("alert")).toContainText("history storage is unavailable");
  await runBatch(page);
  await expect(page.getByRole("region", { name: "Batch history" }).getByRole("listitem")).toHaveCount(0);
});

test("denied local storage reads do not prevent compression", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/jpg-compressor/");
  await expect(page.getByRole("alert")).toContainText("history storage is unavailable");
  await runBatch(page);
  expect(errors).toEqual([]);
});

test("populated history fits supported viewport widths", async ({ page }, testInfo) => {
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Remember future batches in this browser").check();
  await runBatch(page);
  const history = page.getByRole("region", { name: "Batch history" });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await history.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(history.getByRole("button", { name: "Reuse settings" })).toBeVisible();
    await history.screenshot({ path: testInfo.outputPath(`history-${width}.png`) });
  }
});

for (const action of ["clear", "disable"] as const) {
  test(`${action} invalidates an in-flight history record`, async ({ page }) => {
    await page.addInitScript(({ key, settings }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, enabled: true, entries: [{
        id: "old", finishedAt: "2026-09-03T00:00:00.000Z", completed: 1, failed: 0,
        inputBytes: 1000, outputBytes: 500, durationMs: 100, settings
      }] }));
    }, { key: HISTORY_STORAGE_KEY, settings: settingsForPreset("jpg") });
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route(/\.wasm(?:\?|$)/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto("/jpg-compressor/");
    await page.getByLabel("Add images").setInputFiles({ name: "source.png", mimeType: "image/png", buffer: transparentFixturePng() });
    await page.getByRole("button", { name: "Run batch" }).click();
    await expect(page.getByRole("button", { name: "Processing", exact: true })).toBeDisabled();
    const history = page.getByRole("region", { name: "Batch history" });
    if (action === "clear") {
      await history.getByRole("button", { name: "Clear history" }).click();
    } else {
      await page.getByLabel("Remember future batches in this browser").uncheck();
      await page.getByLabel("Remember future batches in this browser").check();
    }
    release();
    await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();
    await expect(history.getByRole("listitem")).toHaveCount(action === "clear" ? 0 : 1);
  });
}
