import { expect, test, type Page } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fixturePng, PNG_SIGNATURE } from "../helpers/imageFixtures";

type BenchmarkCase = {
  name: string;
  route: string;
  quality: number;
  mimeType: "image/png" | "image/jpeg";
  input: Buffer;
};

type BenchmarkResult = {
  name: string;
  quality: number;
  encoder: string;
  inputBytes: number;
  outputBytes: number;
  ratio: number;
  savedPercent: number;
  durationMs: number;
  psnrDb: number | null;
};

async function createPhotoJpeg(page: Page): Promise<Buffer> {
  const base64 = await page.evaluate(async () => {
    const width = 512;
    const height = 512;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    const image = context.createImageData(width, height);
    let seed = 0x12345678;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const noise = ((seed >>> 24) - 128) * 0.22;
        const wave = Math.sin(x / 31) * 18 + Math.cos(y / 43) * 14;
        const index = (y * width + x) * 4;
        image.data[index] = Math.max(0, Math.min(255, 35 + x * 0.31 + wave + noise));
        image.data[index + 1] = Math.max(0, Math.min(255, 25 + y * 0.34 + wave * 0.5 + noise));
        image.data[index + 2] = Math.max(0, Math.min(255, 65 + (x + y) * 0.16 - wave + noise));
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("JPEG fixture encode failed.")), "image/jpeg", 0.96)
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  });

  return Buffer.from(base64, "base64");
}

async function decodedPsnr(
  page: Page,
  input: Buffer,
  inputType: string,
  output: Buffer,
  outputType: string
): Promise<number | null> {
  return page.evaluate(async ({ inputBase64, inputType, outputBase64, outputType }) => {
    async function decode(base64: string, type: string) {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return context.getImageData(0, 0, canvas.width, canvas.height);
    }

    const source = await decode(inputBase64, inputType);
    const result = await decode(outputBase64, outputType);
    if (source.width !== result.width || source.height !== result.height) {
      throw new Error("Benchmark images have different dimensions.");
    }

    let squaredError = 0;
    for (let index = 0; index < source.data.length; index += 4) {
      const sourceAlpha = source.data[index + 3] / 255;
      const resultAlpha = result.data[index + 3] / 255;
      for (let channel = 0; channel < 3; channel += 1) {
        const difference = source.data[index + channel] * sourceAlpha - result.data[index + channel] * resultAlpha;
        squaredError += difference * difference;
      }
      const alphaDifference = source.data[index + 3] - result.data[index + 3];
      squaredError += alphaDifference * alphaDifference;
    }

    const mse = squaredError / source.data.length;
    return mse === 0 ? null : 10 * Math.log10((255 * 255) / mse);
  }, {
    inputBase64: input.toString("base64"),
    inputType,
    outputBase64: output.toString("base64"),
    outputType
  });
}

async function runCase(page: Page, benchmark: BenchmarkCase): Promise<BenchmarkResult> {
  await page.goto(benchmark.route);
  const quality = page.locator('input[type="range"]');
  await quality.fill(String(benchmark.quality / 100));
  await expect(quality).toHaveValue(String(benchmark.quality / 100));

  await page.getByLabel("Add images").setInputFiles({
    name: `${benchmark.name}.${benchmark.mimeType === "image/png" ? "png" : "jpg"}`,
    mimeType: benchmark.mimeType,
    buffer: benchmark.input
  });

  const startedAt = performance.now();
  await page.getByRole("button", { name: "Run batch" }).click();
  const downloadButton = page.getByRole("button", { name: "Download image" });
  await expect(downloadButton).toBeVisible();
  const durationMs = Math.round(performance.now() - startedAt);
  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const output = readFileSync(path!);
  const isPng = benchmark.route.includes("png-compressor");
  const outputType = isPng ? "image/png" : "image/jpeg";

  if (isPng) {
    expect(output.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
  } else {
    expect([...output.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  }

  const encoder = isPng
    ? output.equals(benchmark.input)
      ? "kept-original"
      : output[25] === 3
        ? "imagequant-indexed"
        : "lossless-fallback"
    : "mozjpeg";
  const psnrDb = await decodedPsnr(page, benchmark.input, benchmark.mimeType, output, outputType);

  return {
    name: benchmark.name,
    quality: benchmark.quality,
    encoder,
    inputBytes: benchmark.input.length,
    outputBytes: output.length,
    ratio: Number((output.length / benchmark.input.length).toFixed(4)),
    savedPercent: Number(((1 - output.length / benchmark.input.length) * 100).toFixed(2)),
    durationMs,
    psnrDb: psnrDb === null ? null : Number(psnrDb.toFixed(2))
  };
}

function markdownReport(results: BenchmarkResult[], userAgent: string): string {
  const rows = results.map((result) =>
    `| ${result.name} | ${result.quality} | ${result.encoder} | ${result.inputBytes} | ${result.outputBytes} | ${result.savedPercent}% | ${result.durationMs} | ${result.psnrDb ?? "lossless"} |`
  ).join("\n");

  return `# LittlePNG codec benchmark

- Generated: ${new Date().toISOString()}
- Browser: ${userAgent}
- Fixtures: deterministic 512×512 images plus the optional verified real-image corpus

| Fixture | Quality | Encoder | Input bytes | Output bytes | Saved | Duration ms | PSNR dB |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
${rows}
`;
}

function corpusCases(): BenchmarkCase[] {
  const manifestPath = ".tmp-benchmark-corpus/manifest.json";
  if (!existsSync(manifestPath)) {
    return [];
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    images: Array<{ id: string; mimeType: string; localPath: string }>;
  };

  return manifest.images.map((image) => {
    if (image.mimeType !== "image/png" && image.mimeType !== "image/jpeg") {
      throw new Error(`Unsupported benchmark corpus MIME type: ${image.mimeType}`);
    }

    const isPng = image.mimeType === "image/png";
    return {
      name: `real-${image.id}`,
      route: isPng ? "/png-compressor/" : "/jpg-compressor/",
      quality: isPng ? 82 : 78,
      mimeType: image.mimeType,
      input: readFileSync(image.localPath)
    };
  });
}

test("measure PNG and JPEG codec quality and cost", async ({ page }) => {
  await page.goto("/jpg-compressor/");
  const photoJpeg = await createPhotoJpeg(page);
  const uiPng = fixturePng("ui");
  const gradientPng = fixturePng("gradient");
  const cases: BenchmarkCase[] = [
    ...[65, 82, 90].map((quality) => ({ name: "transparent-ui", route: "/png-compressor/", quality, mimeType: "image/png" as const, input: uiPng })),
    ...[65, 82, 90].map((quality) => ({ name: "gradient", route: "/png-compressor/", quality, mimeType: "image/png" as const, input: gradientPng })),
    ...[65, 78, 85].map((quality) => ({ name: "photo", route: "/jpg-compressor/", quality, mimeType: "image/jpeg" as const, input: photoJpeg })),
    ...corpusCases()
  ];
  const results: BenchmarkResult[] = [];

  for (const benchmark of cases) {
    results.push(await runCase(page, benchmark));
  }

  const userAgent = await page.evaluate(() => navigator.userAgent);
  const outputDirectory = ".tmp-benchmarks";
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(`${outputDirectory}/latest.json`, JSON.stringify({ generatedAt: new Date().toISOString(), userAgent, results }, null, 2));
  writeFileSync(`${outputDirectory}/latest.md`, markdownReport(results, userAgent));
  console.table(results);
});
