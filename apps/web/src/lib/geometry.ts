import type { CropAnchor, CropMode, CropFrame } from "./types";

export type ImageSize = {
  width: number;
  height: number;
};

export type CropBox = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
};

export type ResizeCropPlan = {
  output: ImageSize;
  crop: CropBox;
};

export type ResizeCropSettings = {
  maxWidth: number;
  maxHeight: number;
  cropMode: CropMode;
  cropAnchor: CropAnchor;
  cropFrame?: CropFrame;
};

export function fitWithin(source: ImageSize, maxWidth: number, maxHeight: number): ImageSize {
  const targetMaxWidth = maxWidth > 0 ? maxWidth : source.width;
  const targetMaxHeight = maxHeight > 0 ? maxHeight : source.height;
  const scale = Math.min(targetMaxWidth / source.width, targetMaxHeight / source.height, 1);

  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale))
  };
}

export function createCropBox(
  source: ImageSize,
  target: ImageSize,
  mode: CropMode,
  anchor: CropAnchor
): CropBox {
  if (mode === "fit") {
    return {
      sx: 0,
      sy: 0,
      sw: source.width,
      sh: source.height,
      dx: 0,
      dy: 0,
      dw: target.width,
      dh: target.height
    };
  }

  const sourceRatio = source.width / source.height;
  const targetRatio = target.width / target.height;
  let sw = source.width;
  let sh = source.height;

  if (sourceRatio > targetRatio) {
    sw = source.height * targetRatio;
  } else {
    sh = source.width / targetRatio;
  }

  const point = anchorPoint(anchor);
  const sx = (source.width - sw) * point.x;
  const sy = (source.height - sh) * point.y;

  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: target.width, dh: target.height };
}

export function createResizeCropPlan(source: ImageSize, settings: ResizeCropSettings): ResizeCropPlan {
  if (settings.cropMode === "crop" && settings.cropFrame) {
    const frame = settings.cropFrame;
    const origin = cropFrameOrigin(source, frame, settings.cropAnchor);
    const sx = Math.max(0, origin.x), sy = Math.max(0, origin.y);
    const sw = Math.max(0, Math.min(source.width, origin.x + frame.width) - sx);
    const sh = Math.max(0, Math.min(source.height, origin.y + frame.height) - sy);
    return { output: { width: frame.width, height: frame.height }, crop: {
      sx, sy, sw, sh, dx: sx - origin.x, dy: sy - origin.y, dw: sw, dh: sh
    } };
  }
  const hasFixedCropTarget =
    settings.cropMode !== "fit" && settings.maxWidth > 0 && settings.maxHeight > 0;
  const output = hasFixedCropTarget
    ? cropTargetWithoutUpscaling(source, settings.maxWidth, settings.maxHeight)
    : fitWithin(source, settings.maxWidth, settings.maxHeight);
  return {
    output,
    crop: createCropBox(source, output, settings.cropMode, settings.cropAnchor)
  };
}

function cropTargetWithoutUpscaling(source: ImageSize, targetWidth: number, targetHeight: number): ImageSize {
  const scale = Math.min(1, source.width / targetWidth, source.height / targetHeight);

  return {
    width: Math.max(1, Math.round(targetWidth * scale)),
    height: Math.max(1, Math.round(targetHeight * scale))
  };
}

export function anchorPoint(anchor: CropAnchor): { x: number; y: number } {
  return {
    x: anchor.includes("left") ? 0 : anchor.includes("right") ? 1 : 0.5,
    y: anchor.includes("top") ? 0 : anchor.includes("bottom") ? 1 : 0.5
  };
}

export function cropFrameOrigin(source: ImageSize, frame: CropFrame, anchor: CropAnchor) {
  const point = anchorPoint(anchor);
  const clamp = (value: number, difference: number) => Math.min(Math.max(0, difference), Math.max(Math.min(0, difference), value));
  return {
    x: clamp((source.width - frame.width) * point.x + frame.offsetX, source.width - frame.width),
    y: clamp((source.height - frame.height) * point.y + frame.offsetY, source.height - frame.height)
  };
}
