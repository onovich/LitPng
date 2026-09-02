import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { toolPages } from "../../apps/web/src/data/toolPages";
import {
  PNG_SIGNATURE,
  pngChunkTypes,
  transparentFixturePng
} from "../helpers/imageFixtures";

async function addFixture(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "transparent-fixture.png",
    mimeType: "image/png",
    buffer: transparentFixturePng()
  });
}

test("lossy PNG uses imagequant WASM and preserves palette transparency", async ({ page }) => {
  await page.goto("/png-compressor/");
  await addFixture(page);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

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
  await addFixture(page);
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const output = readFileSync(path!);

  expect([...output.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  expect([...output.subarray(-2)]).toEqual([0xff, 0xd9]);
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
