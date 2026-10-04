import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
import { fixturePng } from "../helpers/imageFixtures";
import { HISTORY_STORAGE_KEY } from "../../apps/web/src/lib/batchHistory";

async function addWidths(page: Page, widths: number[]) {
  if (await page.getByRole("button", { name: "Next: resize & crop" }).count()) {
    await page.getByRole("button", { name: "Next: resize & crop" }).click();
  await page.getByRole("button", { name: "fit", exact: true }).click();
  }
  for (const width of widths) {
    await page.getByLabel("Width limit (px)").fill(String(width));
    await page.getByRole("button", { name: "Add width", exact: true }).click();
  }
}

test("multi-size outputs preserve actual geometry, archive names, reporting, and presets", async ({ page }, testInfo) => {
  await page.goto("/png-compressor/");
  const input = fixturePng("gradient", 512, 256);
  await page.getByLabel("Add images").setInputFiles({ name: "gradient.png", mimeType: "image/png", buffer: input });
  await addWidths(page, [128, 256, 1024]);
  await expect(page.getByLabel("Max width")).toBeDisabled();
  await page.locator(".advancedOptions > summary").click();
  await page.getByLabel("Preset name").fill("Responsive PNG");
  await page.getByTitle("Save").click();
  await page.reload();
  await page.getByLabel("Add images").setInputFiles({ name: "gradient.png", mimeType: "image/png", buffer: input });
  await page.getByRole("button", { name: "Next: resize & crop" }).click();
  await page.getByRole("button", { name: "fit", exact: true }).click();
  await page.locator(".advancedOptions > summary").click();
  await page.getByLabel("My presets").selectOption({ label: "Responsive PNG" });
  await expect(page.getByRole("button", { name: "Remove width", exact: false })).toHaveCount(3);
  await page.locator(".historyDisclosure > summary").click();
  await page.getByLabel("Remember future batches in this browser").check();

  await expect(page.locator(".fileRow")).toHaveCount(3);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(3);
  await expect(page.locator(".flowPanel")).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByTitle("Download ZIP").click();
  const zip = await downloadPromise;
  const entries = unzipSync(readFileSync((await zip.path())!));
  expect(Object.keys(entries).sort()).toEqual([
    "gradient-little-max1024w.png", "gradient-little-max128w.png", "gradient-little-max256w.png"
  ]);
  for (const [limit, width, height] of [[128, 128, 64], [256, 256, 128], [1024, 512, 256]]) {
    const bytes = Buffer.from(entries[`gradient-little-max${limit}w.png`]);
    expect(bytes.readUInt32BE(16)).toBe(width);
    expect(bytes.readUInt32BE(20)).toBe(height);
  }
  const reportPromise = page.waitForEvent("download");
  await page.getByTitle("Download compression report").click();
  const report = readFileSync((await (await reportPromise).path())!, "utf8");
  expect(report).toContain("requested_max_width,output_width,output_height");
  expect(report).toContain(",1024,512,256\r\n");
  const history = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), HISTORY_STORAGE_KEY);
  expect(history.entries[0].inputBytes).toBe(input.length);
  expect(history.entries[0].completed).toBe(3);
  expect(history.entries[0].settings.outputWidths).toEqual([128, 256, 1024]);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(".fileTable").screenshot({ path: testInfo.outputPath(`multi-size-${width}.png`) });
  }
});

test("stopped multi-size outputs retry without expanding again", async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route(/\.wasm(?:\?|$)/, async (route) => { await gate; await route.continue(); });
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Add images").setInputFiles({ name: "gradient.png", mimeType: "image/png", buffer: fixturePng("gradient") });
  await addWidths(page, [128, 256, 384]);

  await page.getByRole("button", { name: "Run batch" }).click();
  await page.getByRole("button", { name: "Stop after current image" }).click();
  release();
  await expect(page.locator(".fileRow .status.cancelled")).toHaveCount(2);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(3);
  await expect(page.locator(".fileRow")).toHaveCount(3);
});

test("width controls reject duplicates and invalid values and restore single-size mode", async ({ page }) => {
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Add images").setInputFiles({ name: "gradient.png", mimeType: "image/png", buffer: fixturePng("gradient") });
  await addWidths(page, [128]);
  await addWidths(page, [128]);
  await expect(page.getByRole("alert")).toContainText("Enter a new whole-number width");
  await addWidths(page, [8193]);
  await expect(page.getByRole("button", { name: "Remove width", exact: false })).toHaveCount(1);

  await page.getByRole("button", { name: "Remove width 128 px" }).click();
  await expect(page.getByLabel("Width limit (px)")).toBeFocused();
  await expect(page.getByLabel("Max width")).toBeEnabled();
  await expect(page.locator(".fileRow")).toHaveCount(1);
  await expect(page.locator(".fileRow")).not.toContainText("max128w");
});
