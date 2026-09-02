import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { toolPages } from "../../apps/web/src/data/toolPages";
import {
  PNG_SIGNATURE,
  fixturePng,
  pngChunkTypes,
  transparentFixturePng
} from "../helpers/imageFixtures";

async function addFixture(page: Page) {
  await page.getByLabel("Add images").setInputFiles({
    name: "transparent-fixture.png",
    mimeType: "image/png",
    buffer: transparentFixturePng()
  });
}

function jpegDimensions(bytes: Buffer): { width: number; height: number } {
  let offset = 2;

  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }

    offset += length + 2;
  }

  throw new Error("JPEG dimensions not found");
}

test("lossy PNG uses imagequant WASM and preserves palette transparency", async ({ page }) => {
  await page.goto("/png-compressor/");
  await addFixture(page);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

  await page.getByTitle("Compare images").click();
  const comparison = page.getByRole("dialog", { name: "Before and after" });
  await expect(comparison).toBeVisible();
  const previews = comparison.locator("img");
  await expect(previews).toHaveCount(2);
  await expect.poll(async () => previews.evaluateAll((images) =>
    images.map((image) => Math.max((image as HTMLImageElement).naturalWidth, (image as HTMLImageElement).naturalHeight))
  )).toEqual([256, 256]);
  await page.keyboard.press("Escape");
  await expect(comparison).toBeHidden();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const output = readFileSync(path!);

  expect(output.subarray(0, 8)).toEqual(PNG_SIGNATURE);
  expect(output[25]).toBe(3);
  expect(pngChunkTypes(output)).toContain("tRNS");
  expect(output.length).toBeLessThan(transparentFixturePng().length);
});

test("PNG graphics can be converted through the MozJPEG worker path", async ({ page }) => {
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Pattern").fill("{date}-{original}-{index}");
  await page.getByLabel("Suffix").fill("");
  await addFixture(page);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const output = readFileSync(path!);

  expect(download.suggestedFilename()).toMatch(/^\d{4}-\d{2}-\d{2}-transparent-fixture-001\.jpg$/);
  expect([...output.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  expect([...output.subarray(-2)]).toEqual([0xff, 0xd9]);
});

test("target size search selects a JPEG result within the requested budget", async ({ page }) => {
  await page.goto("/jpg-compressor/");
  await page.getByLabel("Target size (KB)").fill("12");
  await page.getByLabel("Add images").setInputFiles({
    name: "gradient.png",
    mimeType: "image/png",
    buffer: fixturePng("gradient")
  });
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const output = readFileSync(path!);

  expect([...output.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  expect(output.length).toBeLessThanOrEqual(12 * 1024);

  const reportPromise = page.waitForEvent("download");
  await page.getByTitle("Download compression report").click();
  const reportDownload = await reportPromise;
  const reportPath = await reportDownload.path();
  expect(reportPath).not.toBeNull();
  const report = readFileSync(reportPath!, "utf8");

  expect(report.charCodeAt(0)).toBe(0xfeff);
  expect(report).toContain("source_name,output_name");
  expect(report).toContain("gradient.png");
  expect(report).toContain(",true,");
});

test("Open Graph preset produces a real 1200 by 630 sharing card", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Publishing preset").selectOption("open-graph");
  await expect(page.getByText("JPEG sharing card cropped to the common 1200 × 630 ratio.")).toBeVisible();
  await expect(page.getByLabel("Max width")).toHaveValue("1200");
  await expect(page.getByLabel("Max height")).toHaveValue("630");

  await page.getByLabel("Add images").setInputFiles({
    name: "sharing-card-source.png",
    mimeType: "image/png",
    buffer: fixturePng("gradient", 1600, 1200)
  });
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(download.suggestedFilename()).toBe("sharing-card-source-og.jpg");
  expect(jpegDimensions(readFileSync(path!))).toEqual({ width: 1200, height: 630 });
});

test("custom presets persist, apply, and delete in the browser", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Publishing preset").selectOption("open-graph");
  await page.getByLabel("Preset name").fill("Social cards");
  await page.getByTitle("Save").click();
  await expect(page.getByText("Preset saved in this browser.", { exact: true })).toBeVisible();

  await page.getByLabel("Max width").fill("900");
  await expect(page.getByLabel("My presets")).toHaveValue("");
  await page.reload();
  await page.getByLabel("My presets").selectOption({ label: "Social cards" });
  await expect(page.getByLabel("Max width")).toHaveValue("1200");
  await expect(page.getByLabel("Max height")).toHaveValue("630");
  await expect(page.getByLabel("Format")).toHaveValue("image/jpeg");

  await page.getByTitle("Delete").click();
  await expect(page.getByText("Preset deleted.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("My presets").locator("option")).toHaveCount(1);
});

test("technical SEO exposes every tool route", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()["content-type"]).toMatch(/^(application|text)\/xml/);
  const sitemapBody = await sitemap.text();

  for (const toolPage of toolPages) {
    expect(sitemapBody).toContain(new URL(toolPage.path, "https://littlepng.com").toString());
  }

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("https://littlepng.com/sitemap.xml");
});

test("folder import and custom naming controls fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/compress-and-rename-images/");

  await expect(page.getByRole("button", { name: "Add images" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add folder" })).toBeVisible();
  await expect(page.getByLabel("Pattern")).toBeVisible();
  await expect(page.getByLabel("Preserve folder structure in ZIP")).toBeVisible();
  await expect(page.getByLabel("Publishing preset")).toBeVisible();
  await expect(page.getByLabel("My presets")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
