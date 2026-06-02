import type { ImageSettings, WorkerRequest, WorkerResponse } from "../lib/types";
import { createResizeCropPlan } from "../lib/geometry";
import { shouldKeepOriginal } from "../lib/processingPolicy";

function outputType(inputType: string, settings: ImageSettings): string {
  if (settings.outputFormat !== "original") {
    return settings.outputFormat;
  }

  if (inputType === "image/jpeg" || inputType === "image/png" || inputType === "image/webp") {
    return inputType;
  }

  return "image/png";
}

async function encodeCanvas(canvas: OffscreenCanvas, type: string, quality: number): Promise<Blob> {
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Canvas context is unavailable for encoding.");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  if (type === "image/jpeg") {
    const { encode } = await import("@jsquash/jpeg");
    const bytes = await encode(imageData, { quality: Math.round(quality * 100) });
    return new Blob([bytes], { type });
  }

  if (type === "image/png") {
    const { encode } = await import("@jsquash/png");
    const bytes = await encode(imageData);
    return new Blob([bytes], { type });
  }

  return canvas.convertToBlob({ type, quality });
}

function hasPixelTransform(
  source: { width: number; height: number },
  plan: ReturnType<typeof createResizeCropPlan>
): boolean {
  const box = plan.crop;

  return (
    plan.output.width !== source.width ||
    plan.output.height !== source.height ||
    Math.abs(box.sx) > 0.001 ||
    Math.abs(box.sy) > 0.001 ||
    Math.abs(box.sw - source.width) > 0.001 ||
    Math.abs(box.sh - source.height) > 0.001 ||
    Math.abs(box.dx) > 0.001 ||
    Math.abs(box.dy) > 0.001 ||
    Math.abs(box.dw - source.width) > 0.001 ||
    Math.abs(box.dh - source.height) > 0.001
  );
}

function outcomeFor(inputType: string, outputType: string, transformed: boolean, keptOriginal: boolean) {
  if (keptOriginal) {
    return "kept-original";
  }

  if (transformed) {
    return "transformed";
  }

  if (inputType !== outputType) {
    return "converted";
  }

  return "compressed";
}

async function processImage(request: WorkerRequest): Promise<WorkerResponse> {
  const startedAt = performance.now();

  try {
    const type = outputType(request.file.type, request.settings);

    if (request.settings.compressionMode === "lossless" && (request.file.type !== "image/png" || type !== "image/png")) {
      throw new Error("Lossless mode currently supports PNG inputs only.");
    }

    const bitmap = await createImageBitmap(request.file);
    const source = { width: bitmap.width, height: bitmap.height };
    const plan = createResizeCropPlan(source, request.settings);
    const canvas = new OffscreenCanvas(plan.output.width, plan.output.height);
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    if (type === "image/jpeg") {
      context.fillStyle = request.settings.background;
      context.fillRect(0, 0, plan.output.width, plan.output.height);
    } else {
      context.clearRect(0, 0, plan.output.width, plan.output.height);
    }

    const box = plan.crop;
    context.drawImage(bitmap, box.sx, box.sy, box.sw, box.sh, box.dx, box.dy, box.dw, box.dh);
    bitmap.close();

    const encodedBlob = await encodeCanvas(canvas, type, request.settings.quality);
    const transformed = hasPixelTransform(source, plan);
    const keptOriginal = shouldKeepOriginal({
      sourceSize: request.file.size,
      encodedSize: encodedBlob.size,
      inputType: request.file.type,
      outputType: type,
      hasPixelTransform: transformed,
      compressionMode: request.settings.compressionMode
    });
    const blob = keptOriginal ? request.file : encodedBlob;
    const resultType = keptOriginal ? request.file.type || type : type;

    return {
      type: "done",
      jobId: request.jobId,
      result: {
        name: request.outputName,
        blob,
        type: resultType,
        width: plan.output.width,
        height: plan.output.height,
        size: blob.size,
        durationMs: Math.round(performance.now() - startedAt),
        outcome: outcomeFor(request.file.type, type, transformed, keptOriginal)
      }
    };
  } catch (error) {
    return {
      type: "failed",
      jobId: request.jobId,
      error: error instanceof Error ? error.message : "Image processing failed."
    };
  }
}

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== "process") {
    return;
  }

  const response = await processImage(event.data);
  self.postMessage(response);
});
