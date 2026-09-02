import { describe, expect, it } from "vitest";
import { createCropBox, createResizeCropPlan, fitWithin } from "./geometry";

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
