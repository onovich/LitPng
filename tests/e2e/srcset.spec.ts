import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
import { fixturePng } from "../helpers/imageFixtures";

test("responsive HTML matches ZIP artifacts and supports copy, fallback, and responsive layout", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/png-compressor/");
  await expect(page.locator(".srcsetExport")).toHaveCount(0);
  await page.getByLabel("Add images").setInputFiles({
    name: "gradient.png", mimeType: "image/png", buffer: fixturePng("gradient", 512, 256)
  });
  await page.getByRole("button", { name: "Next: resize & crop" }).click();
  await page.getByRole("button", { name: "fit", exact: true }).click();
  for (const width of [128, 256, 1024, 2048]) {
    await page.getByLabel("Width limit (px)").fill(String(width));
    await page.getByRole("button", { name: "Add width", exact: true }).click();
  }

  const panel = page.locator(".srcsetExport");
  await panel.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("status")).toHaveText("Process multi-size images to generate HTML here.");
  await page.getByRole("button", { name: "Run batch" }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(4);
  const code = page.getByLabel("Responsive image HTML", { exact: true });
  await expect(code).toHaveValue(/512w/);
  const sizes = page.getByLabel("Display sizes (CSS)");
  await sizes.fill("(max-width: 600px) 100vw, 50vw");
  const markup = await code.inputValue();
  expect(markup).not.toContain("1024w\"");
  const parsed = await page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return [...doc.querySelectorAll("img")].map((img) => ({
      src: img.getAttribute("src"), srcset: img.getAttribute("srcset")!, sizes: img.sizes,
      width: img.width, height: img.height, alt: img.alt
    }));
  }, markup);
  expect(parsed).toHaveLength(1);
  expect(parsed[0]).toMatchObject({ width: 512, height: 256, sizes: "(max-width: 600px) 100vw, 50vw", alt: "" });
  const zipPromise = page.waitForEvent("download");
  await page.getByTitle("Download ZIP").click();
  const entries = unzipSync(readFileSync((await (await zipPromise).path())!));
  const candidates = parsed[0].srcset.split(",").map((candidate) => candidate.trim().split(/\s+/));
  expect(candidates.map(([, width]) => width)).toEqual(["128w", "256w", "512w"]);
  for (const [url, width] of candidates) {
    const png = Buffer.from(entries[decodeURIComponent(url.slice(2))]);
    expect(png.readUInt32BE(16)).toBe(Number.parseInt(width));
  }
  const htmlPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download HTML" }).click();
  const html = await htmlPromise;
  expect(html.suggestedFilename()).toBe("littlepng-srcset.html");
  expect(readFileSync((await html.path())!, "utf8")).toBe(markup);

  // Stub only clipboard permission behavior; generated code/downloads are real.
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true, value: { writeText: async (text: string) => { (window as any).copiedHtml = text; } }
  }));
  await code.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Copy HTML" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("status")).toHaveText("HTML copied.");
  expect(await page.evaluate(() => (window as any).copiedHtml)).toBe(markup);
  await sizes.fill("100vw");
  await expect(panel.getByRole("status")).toBeEmpty();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true, value: { writeText: async () => { throw new Error("Denied"); } }
  }));
  await page.getByRole("button", { name: "Copy HTML" }).click();
  await expect(panel.getByRole("status")).toContainText("Copy unavailable");
  await expect(code).toBeFocused();
  expect(await code.evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart)).toBe((await code.inputValue()).length);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel.screenshot({ path: testInfo.outputPath(`srcset-${width}.png`) });
  }
  await page.getByRole("button", { name: "Remove completed", exact: true }).click();
  await expect(panel).toHaveCount(0);
  expect(errors).toEqual([]);
});
