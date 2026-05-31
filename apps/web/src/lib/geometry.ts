import type { CropAnchor, CropMode } from "./types";

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

  let sx = (source.width - sw) / 2;
  let sy = (source.height - sh) / 2;

  if (anchor === "left") {
    sx = 0;
  }

  if (anchor === "right") {
    sx = source.width - sw;
  }

  if (anchor === "top") {
    sy = 0;
  }

  if (anchor === "bottom") {
    sy = source.height - sh;
  }

  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: target.width, dh: target.height };
}

export function createResizeCropPlan(source: ImageSize, settings: ResizeCropSettings): ResizeCropPlan {
  const output = fitWithin(source, settings.maxWidth, settings.maxHeight);
  return {
    output,
    crop: createCropBox(source, output, settings.cropMode, settings.cropAnchor)
  };
}
