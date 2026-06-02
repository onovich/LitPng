import type { ToolPage } from "../data/toolPages";

export type OutputFormat = "original" | "image/jpeg" | "image/png" | "image/webp";
export type CropMode = "fit" | "fill" | "crop";
export type CropAnchor = "center" | "top" | "bottom" | "left" | "right";
export type CompressionMode = "lossless" | "lossy";

export type ImageSettings = {
  compressionMode: CompressionMode;
  outputFormat: OutputFormat;
  quality: number;
  renamePattern: string;
  prefix: string;
  suffix: string;
  lowercase: boolean;
  hyphenate: boolean;
  stripSpecial: boolean;
  maxWidth: number;
  maxHeight: number;
  cropMode: CropMode;
  cropAnchor: CropAnchor;
  background: string;
};

export type ImageJobStatus =
  | "queued"
  | "processing"
  | "done"
  | "failed"
  | "cancelled";

export type ImageJob = {
  id: string;
  file: File;
  sourceName: string;
  outputName: string;
  sourceSize: number;
  sourceType: string;
  sourceWidth?: number;
  sourceHeight?: number;
  status: ImageJobStatus;
  progress: number;
  result?: ProcessedImage;
  error?: string;
};

export type ProcessedImage = {
  name: string;
  blob: Blob;
  type: string;
  width: number;
  height: number;
  size: number;
  durationMs: number;
  outcome: "compressed" | "kept-original" | "converted" | "transformed";
};

export type WorkerRequest = {
  type: "process";
  jobId: string;
  file: File;
  outputName: string;
  settings: ImageSettings;
};

export type WorkerResponse =
  | {
      type: "done";
      jobId: string;
      result: ProcessedImage;
    }
  | {
      type: "failed";
      jobId: string;
      error: string;
    };

export function settingsForPreset(preset: ToolPage["preset"]): ImageSettings {
  const base: ImageSettings = {
    compressionMode: "lossless",
    outputFormat: "original",
    quality: 0.82,
    renamePattern: "{original}",
    prefix: "",
    suffix: "-little",
    lowercase: true,
    hyphenate: true,
    stripSpecial: true,
    maxWidth: 0,
    maxHeight: 0,
    cropMode: "fit",
    cropAnchor: "center",
    background: "#ffffff"
  };

  if (preset === "png") {
    return { ...base, outputFormat: "image/png", quality: 0.9 };
  }

  if (preset === "jpg") {
    return { ...base, compressionMode: "lossy", outputFormat: "image/jpeg", quality: 0.78 };
  }

  if (preset === "bulk") {
    return { ...base, renamePattern: "{original}-{index}" };
  }

  if (preset === "rename") {
    return { ...base, renamePattern: "{prefix}-{index}", prefix: "image" };
  }

  if (preset === "resize") {
    return { ...base, compressionMode: "lossy", maxWidth: 1600, cropMode: "fit" };
  }

  return base;
}
