import { describe, expect, it } from "vitest";
import { cleanStem, outputNameFor, uniqueNames } from "./filenames";
import { settingsForPreset } from "./types";

function imageFile(name: string, type = "image/jpeg"): File {
  return new File(["x"], name, { type });
}

describe("cleanStem", () => {
  it("normalizes filenames for web publishing", () => {
    expect(cleanStem(" Product Shot_01 ! ", settingsForPreset("balanced"))).toBe("product-shot-01");
  });
});

describe("outputNameFor", () => {
  it("applies pattern, suffix, and output extension", () => {
    const settings = { ...settingsForPreset("jpg"), renamePattern: "{original}-{index}", suffix: "tiny" };
    expect(outputNameFor(imageFile("Hero Image.PNG", "image/png"), 2, settings)).toBe("hero-image-003-tiny.jpg");
  });
});

describe("uniqueNames", () => {
  it("deduplicates repeated output names", () => {
    expect(uniqueNames(["a.jpg", "a.jpg", "b.jpg", "a.jpg"])).toEqual(["a.jpg", "a-2.jpg", "b.jpg", "a-3.jpg"]);
  });
});
