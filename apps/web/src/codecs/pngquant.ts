import initPngquant, {
  quantize_rgba
} from "./pngquant-wasm/littlepng_pngquant_wasm.js";
import type { PngQuantizationOptions } from "../lib/codecPolicy";

let initialization: Promise<unknown> | undefined;

function initialize(): Promise<unknown> {
  initialization ??= initPngquant();
  return initialization;
}

export async function encodeQuantizedPng(
  imageData: ImageData,
  options: PngQuantizationOptions
): Promise<Blob> {
  await initialize();

  const rgba = new Uint8Array(
    imageData.data.buffer,
    imageData.data.byteOffset,
    imageData.data.byteLength
  );
  const result = quantize_rgba(
    rgba,
    imageData.width,
    imageData.height,
    options.minQuality,
    options.targetQuality,
    options.speed
  );

  try {
    const bytes = Uint8Array.from(result.png_bytes);
    return new Blob([bytes.buffer], { type: "image/png" });
  } finally {
    result.free();
  }
}
