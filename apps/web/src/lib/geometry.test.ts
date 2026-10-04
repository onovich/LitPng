import { describe, expect, it } from "vitest";
import { createCropBox, createResizeCropPlan, fitWithin, cropFrameOrigin } from "./geometry";

describe("fitWithin", () => {
  it("keeps smaller images at original size", () => {
    expect(fitWithin({ width: 800, height: 600 }, 1600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales down by the tightest bound", () => {
    expect(fitWithin({ width: 4000, height: 2000 }, 1000, 800)).toEqual({ width: 1000, height: 500 });
  });
});

describe("createCropBox", () => {
  it("uses the full source image in fit mode", () => {
    expect(createCropBox({ width: 1200, height: 800 }, { width: 600, height: 400 }, "fit", "center")).toEqual({
      sx: 0,
      sy: 0,
      sw: 1200,
      sh: 800,
      dx: 0,
      dy: 0,
      dw: 600,
      dh: 400
    });
  });

  it("crops horizontal overflow for square fill", () => {
    expect(createCropBox({ width: 1200, height: 800 }, { width: 600, height: 600 }, "fill", "center")).toMatchObject({
      sx: 200,
      sy: 0,
      sw: 800,
      sh: 800
    });
  });
});

describe("createResizeCropPlan", () => {
  it("creates the requested aspect and dimensions for crop mode", () => {
    const plan = createResizeCropPlan(
      { width: 1600, height: 1200 },
      { maxWidth: 1200, maxHeight: 630, cropMode: "crop", cropAnchor: "center" }
    );

    expect(plan.output).toEqual({ width: 1200, height: 630 });
    expect(plan.crop).toMatchObject({ sx: 0, sy: 180, sw: 1600, sh: 840, dw: 1200, dh: 630 });
  });

  it("keeps the crop aspect without upscaling a small source", () => {
    const plan = createResizeCropPlan(
      { width: 512, height: 512 },
      { maxWidth: 1200, maxHeight: 630, cropMode: "crop", cropAnchor: "center" }
    );

    expect(plan.output).toEqual({ width: 512, height: 269 });
    expect(plan.crop.dw / plan.crop.dh).toBeCloseTo(1200 / 630, 2);
  });

  it("keeps fit mode aspect-preserving", () => {
    const plan = createResizeCropPlan(
      { width: 1600, height: 1200 },
      { maxWidth: 1200, maxHeight: 630, cropMode: "fit", cropAnchor: "center" }
    );

    expect(plan.output).toEqual({ width: 840, height: 630 });
  });
});


describe("visual batch crop", () => {
  it("places all nine anchors on their matching source positions", () => {
    const frame = { width: 100, height: 80, offsetX: 0, offsetY: 0 };
    const anchors = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"] as const;
    anchors.forEach((anchor, i) => {
      expect(cropFrameOrigin({ width: 300, height: 240 }, frame, anchor)).toEqual({ x: (i % 3) * 100, y: Math.floor(i / 3) * 80 });
    });
  });
  it("uses the same native pixel dimensions and relative offsets across a batch", () => {
    const settings = { maxWidth: 100, maxHeight: 80, cropMode: "crop" as const, cropAnchor: "bottom-right" as const, cropFrame: { width: 100, height: 80, offsetX: -20, offsetY: -10 } };
    for (const source of [{ width: 300, height: 240 }, { width: 500, height: 400 }]) {
      const plan = createResizeCropPlan(source, settings);
      expect(plan.output).toEqual({ width: 100, height: 80 });
      expect(plan.crop).toEqual({ sx: source.width - 120, sy: source.height - 90, sw: 100, sh: 80, dx: 0, dy: 0, dw: 100, dh: 80 });
    }
  });
  it("clamps offsets at each image boundary", () => {
    expect(cropFrameOrigin({ width: 300, height: 240 }, { width: 100, height: 80, offsetX: 1000, offsetY: -1000 }, "center")).toEqual({ x: 200, y: 0 });
  });
  it("pads smaller sources while preserving exact batch dimensions and anchor", () => {
    const plan = createResizeCropPlan({ width: 60, height: 40 }, { maxWidth: 100, maxHeight: 80, cropMode: "crop", cropAnchor: "bottom-right", cropFrame: { width: 100, height: 80, offsetX: 0, offsetY: 0 } });
    expect(plan.output).toEqual({ width: 100, height: 80 });
    expect(plan.crop).toEqual({ sx: 0, sy: 0, sw: 60, sh: 40, dx: 40, dy: 40, dw: 60, dh: 40 });
  });
});
