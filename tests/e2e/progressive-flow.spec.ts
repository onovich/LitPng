import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { transparentFixturePng } from "../helpers/imageFixtures";

test("import reveals compression, resize is a later step, and clearing restores the quiet start", async ({ page }) => {
  await page.goto("/png-compressor/");
  await expect(page.locator(".flowPanel")).toHaveCount(0);
  await expect(page.locator(".fileTable")).toHaveCount(0);
  await expect(page.locator(".actions")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add images", exact: true })).toBeVisible();
  await expect(page.locator(".historyDisclosure")).not.toHaveAttribute("open");

  await page.getByLabel("Add images").setInputFiles({
    name: "source.png", mimeType: "image/png", buffer: transparentFixturePng()
  });
  await expect(page.getByRole("region", { name: "Compression", exact: true })).toBeVisible();
  await expect(page.getByLabel("Max width")).toHaveCount(0);
  await expect(page.getByLabel("Publishing preset")).not.toBeVisible();
  await expect(page.getByTitle("Download ZIP")).toHaveCount(0);
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image", exact: true }).click();
  const compressed = readFileSync((await (await download).path())!);
  expect(compressed.readUInt32BE(16)).toBe(256);

  await page.getByRole("button", { name: "Next: resize & crop", exact: true }).click();
  await page.getByRole("button", { name: "fit", exact: true }).click();
  await expect(page.getByRole("region", { name: "Resize & crop", exact: true })).toBeVisible();
  await expect(page.locator(".fileRow")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(0);
  await page.getByLabel("Max width").fill("64");
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toBeVisible();
  const resizedDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download image", exact: true }).click();
  const resized = readFileSync((await (await resizedDownload).path())!);
  expect(resized.readUInt32BE(16)).toBe(64);
  expect(resized.readUInt32BE(20)).toBe(64);
  await page.getByRole("button", { name: "Clear queue", exact: true }).click();
  await expect(page.locator(".flowPanel")).toHaveCount(0);
  await expect(page.locator(".fileTable")).toHaveCount(0);
});

test("the default mixed-image batch accepts JPEG photos and PNG images", async ({ page }) => {
  await page.goto("/");
  const jpeg = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    canvas.getContext("2d")!.fillRect(0, 0, 64, 64);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), "image/jpeg"));
    return [...new Uint8Array(await blob.arrayBuffer())];
  });
  await page.getByLabel("Add images").setInputFiles([
    { name: "photo.jpeg", mimeType: "image/jpeg", buffer: Buffer.from(jpeg) },
    { name: "drawing.png", mimeType: "image/png", buffer: transparentFixturePng() }
  ]);
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(2);
  await expect(page.locator(".status.failed")).toHaveCount(0);
  await expect(page.locator(".fileRow").first()).toContainText("photo-little.jpeg");
  await page.getByRole("button", { name: "Clear queue", exact: true }).click();
  await page.getByLabel("Add images").setInputFiles({ name: "photo.jpeg", mimeType: "image/jpeg", buffer: Buffer.from(jpeg) });
  await page.getByRole("button", { name: "Lossless", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Lossless mode only supports PNG");
  await expect(page.getByRole("button", { name: "Run batch", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Lossy", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download image", exact: true })).toHaveCount(1);
});

test("existing image errors follow the selected language", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Add images").setInputFiles({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("invalid image") });
  await page.getByRole("button", { name: "Run batch", exact: true }).click();
  await expect(page.locator(".fileError")).toHaveText("This image could not be read. Check the file or choose another image.");
  await page.locator(".languageSwitch").click();
  await expect(page.locator(".fileError")).toHaveText("无法读取这张图片，请检查文件或换一张图片。");
  await expect(page.locator(".status.failed")).toHaveText("失败");
  await page.locator(".languageSwitch").click();
  await expect(page.locator(".fileError")).toHaveText("Не удалось прочитать изображение. Проверьте файл или выберите другой.");
});
