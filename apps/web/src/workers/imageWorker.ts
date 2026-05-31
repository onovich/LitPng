import type { ImageSettings, WorkerRequest, WorkerResponse } from "../lib/types";
import { createResizeCropPlan } from "../lib/geometry";

function outputType(inputType: string, settings: ImageSettings): string {
  if (settings.outputFormat !== "original") {
    return settings.outputFormat;
  }

  if (inputType === "image/jpeg" || inputType === "image/png" || inputType === "image/webp") {
    return inputType;
  }

  return "image/png";
}

async function processImage(request: WorkerRequest): Promise<WorkerResponse> {
  const startedAt = performance.now();

  try {
    const bitmap = await createImageBitmap(request.file);
    const plan = createResizeCropPlan({ width: bitmap.width, height: bitmap.height }, request.settings);
    const canvas = new OffscreenCanvas(plan.output.width, plan.output.height);
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    context.fillStyle = request.settings.background;
    context.fillRect(0, 0, plan.output.width, plan.output.height);

    const box = plan.crop;
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
        width: plan.output.width,
        height: plan.output.height,
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
