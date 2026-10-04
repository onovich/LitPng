import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fixturePng } from "../helpers/imageFixtures";

test("visual crop moves and resizes, anchors the batch, and exports a uniform size including small images", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Add images").setInputFiles([
    { name: "reference.png", mimeType: "image/png", buffer: fixturePng("gradient", 300, 240) },
    { name: "larger.png", mimeType: "image/png", buffer: fixturePng("gradient", 500, 400) },
    { name: "small.png", mimeType: "image/png", buffer: fixturePng("gradient", 60, 40) }
  ]);
  await page.getByRole("button", { name: "Next: resize & crop", exact: true }).click();
  await expect(page.locator(".cropReference")).toContainText("reference.png · 300 × 240px");
  const frame = page.getByRole("group", { name: "Crop frame", exact: true });
  await expect(frame).toBeVisible();
  await expect(page.locator(".anchorSelector button")).toHaveCount(9);
  await page.locator(".cropPrecision summary").click();
  await frame.focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect(page.getByLabel("Horizontal offset")).toHaveValue("10");
  const box = (await frame.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 12, box.y + box.height / 2); await page.mouse.up();
  expect(Number(await page.getByLabel("Horizontal offset").inputValue())).toBeLessThan(10);
  const handle = page.getByRole("button", { name: "Resize frame: Bottom right", exact: true });
  await handle.focus(); await page.keyboard.press("Shift+ArrowLeft");
  await expect(page.getByLabel("Max width")).toHaveValue("230");
  await page.getByRole("button", { name: "Anchor: Bottom right", exact: true }).click();
  await expect(page.getByLabel("Horizontal offset")).toHaveValue("0");
  await page.getByLabel("Max width").fill("100");
  await page.getByLabel("Max height").fill("80");
  await page.getByLabel("Horizontal offset").fill("-20");
  await page.getByLabel("Vertical offset").fill("-10");
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(3);
  await expect(page.locator(".visualCrop")).toHaveCount(0);
  await expect(page.locator(".flowPanel")).toHaveCount(0);
  await expect(page.locator(".dropzone")).not.toHaveClass(/hasTasks/);
  let index = 0;
  for (const button of await page.getByRole("button", { name: "Download image", exact: true }).all()) {
    const event = page.waitForEvent("download"); await button.click();
    const bytes = readFileSync((await (await event).path())!);
    expect(bytes.readUInt32BE(16)).toBe(100); expect(bytes.readUInt32BE(20)).toBe(80);
    const pixel = await page.evaluate(async (data) => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(data)], { type: "image/png" }));
      const canvas = document.createElement("canvas"); canvas.width = 100; canvas.height = 80;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(bitmap, 0, 0); bitmap.close();
      return [...ctx.getImageData(0, 0, 1, 1).data];
    }, [...bytes]);
    if (index < 2) {
      const sourceWidth = index === 0 ? 300 : 500;
      expect(Math.abs(pixel[0] - Math.round((sourceWidth - 120) / (sourceWidth - 1) * 255))).toBeLessThan(12);
    } else expect(pixel[3]).toBe(0);
    index++;
  }
  await page.getByLabel("Add images", { exact: true }).setInputFiles({ name: "next.png", mimeType: "image/png", buffer: fixturePng("gradient", 200, 160) });
  await expect(page.getByRole("region", { name: "Compression", exact: true })).toBeVisible();
  await expect(page.locator(".visualCrop")).toHaveCount(0);
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(4);
  const nextDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image", exact: true }).last().click();
  const nextBytes = readFileSync((await (await nextDownload).path())!);
  expect(nextBytes.readUInt32BE(16)).toBe(200);
  expect(nextBytes.readUInt32BE(20)).toBe(160);
});
