import { createResizeCropPlan } from "./geometry";
import type { ImageJob, ImageSettings, OutputFormat } from "./types";

export type KeepOriginalInput = {
  sourceSize: number;
  encodedSize: number;
  inputType: string;
  outputType: string;
  hasPixelTransform: boolean;
  compressionMode: ImageSettings["compressionMode"];
};

export function shouldKeepOriginal(input: KeepOriginalInput): boolean {
  if (input.compressionMode === "lossless") {
    if (input.hasPixelTransform) {
      return true;
    }

    if (input.outputType === "image/jpeg" || input.outputType === "image/webp") {
      return true;
    }
  }

  return (
    !input.hasPixelTransform &&
    input.inputType === input.outputType &&
    input.encodedSize >= input.sourceSize
  );
}

export function normalizedSettings(settings: ImageSettings): ImageSettings {
  if (settings.compressionMode === "lossy") {
    return settings;
  }

  return {
    ...settings,
    outputFormat: "image/png",
    targetSizeKb: 0,
    maxWidth: 0,
    maxHeight: 0,
    cropMode: "fit"
  };
}

function resolvedOutputType(inputType: string, outputFormat: OutputFormat): string {
  if (outputFormat !== "original") {
    return outputFormat;
  }

  if (inputType === "image/jpeg" || inputType === "image/png" || inputType === "image/webp") {
    return inputType;
  }

  return "image/png";
}

function formatLoss(outputType: string, quality: number): number {
  if (outputType === "image/jpeg") {
    return Math.max(4, (1 - quality) * 78);
  }

  if (outputType === "image/webp") {
    return Math.max(3, (1 - quality) * 58);
  }

  if (outputType === "image/png") {
    return Math.max(2, (1 - quality) * 45);
  }

  return 0;
}

function transformLoss(job: ImageJob, settings: ImageSettings): number {
  if (!job.sourceWidth || !job.sourceHeight) {
    if (settings.maxWidth > 0 || settings.maxHeight > 0 || settings.cropMode !== "fit") {
      return settings.cropMode === "fit" ? 12 : 24;
    }

    return 0;
  }

  const sourceArea = job.sourceWidth * job.sourceHeight;
  const plan = createResizeCropPlan({ width: job.sourceWidth, height: job.sourceHeight }, settings);
  const outputArea = plan.output.width * plan.output.height;
  const pixelLoss = Math.max(0, 1 - outputArea / sourceArea);
  const cropLoss = settings.cropMode === "fit" ? 0 : 12;

  return Math.min(65, pixelLoss * 55 + cropLoss);
}

export type LossEstimate = {
  percent: number;
  label: "None" | "Low" | "Medium" | "High";
};

export function estimateVisualLoss(settings: ImageSettings, jobs: ImageJob[]): LossEstimate {
  const normalized = normalizedSettings(settings);

  if (normalized.compressionMode === "lossless") {
    return { percent: 0, label: "None" };
  }

  const measuredJobs = jobs.length > 0 ? jobs : [{
    id: "estimate",
    file: undefined as unknown as File,
    sourceName: "estimate.png",
    outputName: "estimate.png",
    sourceSize: 1,
    sourceType: "image/png",
    status: "queued",
    progress: 0
  } satisfies ImageJob];

  const totalSize = measuredJobs.reduce((sum, job) => sum + Math.max(job.sourceSize, 1), 0);
  const weightedLoss = measuredJobs.reduce((sum, job) => {
    const outputType = resolvedOutputType(job.sourceType, normalized.outputFormat);
    const loss = formatLoss(outputType, normalized.quality) + transformLoss(job, normalized);
    return sum + Math.min(100, loss) * Math.max(job.sourceSize, 1);
  }, 0) / totalSize;

  const percent = Math.round(Math.min(100, weightedLoss));

  if (percent === 0) {
    return { percent, label: "None" };
  }

  if (percent < 16) {
    return { percent, label: "Low" };
  }

  if (percent < 36) {
    return { percent, label: "Medium" };
  }

  return { percent, label: "High" };
}
