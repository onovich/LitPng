import type { ImageSettings, WorkerRequest, WorkerResponse } from "../lib/types";

function outputType(inputType: string, settings: ImageSettings): string {
  if (settings.outputFormat !== "original") {
    return settings.outputFormat;
  }

  if (inputType === "image/jpeg" || inputType === "image/png" || inputType === "image/webp") {
    return inputType;
  }

  return "image/png";
}

function fitSize(width: number, height: number, settings: ImageSettings): { width: number; height: number } {
  const maxWidth = settings.maxWidth || width;
  const maxHeight = settings.maxHeight || height;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function cropBox(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  settings: ImageSettings
): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number } {
  if (settings.cropMode === "fit") {
    return { sx: 0, sy: 0, sw: sourceWidth, sh: sourceHeight, dx: 0, dy: 0, dw: targetWidth, dh: targetHeight };
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
  } else {
    sh = sourceWidth / targetRatio;
  }

  let sx = (sourceWidth - sw) / 2;
  let sy = (sourceHeight - sh) / 2;

  if (settings.cropAnchor === "left") {
    sx = 0;
  }

  if (settings.cropAnchor === "right") {
    sx = sourceWidth - sw;
  }

  if (settings.cropAnchor === "top") {
    sy = 0;
  }

  if (settings.cropAnchor === "bottom") {
    sy = sourceHeight - sh;
  }

  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: targetWidth, dh: targetHeight };
}

async function processImage(request: WorkerRequest): Promise<WorkerResponse> {
  const startedAt = performance.now();

  try {
    const bitmap = await createImageBitmap(request.file);
    const size = fitSize(bitmap.width, bitmap.height, request.settings);
    const canvas = new OffscreenCanvas(size.width, size.height);
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    context.fillStyle = request.settings.background;
    context.fillRect(0, 0, size.width, size.height);

    const box = cropBox(bitmap.width, bitmap.height, size.width, size.height, request.settings);
    context.drawImage(bitmap, box.sx, box.sy, box.sw, box.sh, box.dx, box.dy, box.dw, box.dh);
    bitmap.close();

    const type = outputType(request.file.type, request.settings);
    const blob = await canvas.convertToBlob({
      type,
      quality: type === "image/png" ? undefined : request.settings.quality
    });

    return {
      type: "done",
      jobId: request.jobId,
      result: {
        name: request.outputName,
        blob,
        type,
        width: size.width,
        height: size.height,
        size: blob.size,
        durationMs: Math.round(performance.now() - startedAt)
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
