import { describe, expect, it } from "vitest";
import { archivePathFor, cleanStem, outputNameFor, uniqueNames, uniqueNamesByDirectory } from "./filenames";
import { settingsForPreset } from "./types";

function imageFile(name: string, type = "image/jpeg"): File {
  return new File(["x"], name, { type, lastModified: Date.UTC(2026, 8, 3) });
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

  it("supports folder, date, and custom token combinations", () => {
    const settings = { ...settingsForPreset("jpg"), renamePattern: "{folder}-{date}-{original}-{index}", suffix: "" };
    expect(outputNameFor(imageFile("Hero Image.PNG", "image/png"), 0, settings, { relativePath: "campaign/Hero Image.PNG" }))
      .toBe("campaign-2026-09-03-hero-image-001.jpg");
  });

  it("removes unsupported tokens instead of leaking them into filenames", () => {
    const settings = { ...settingsForPreset("balanced"), renamePattern: "{original}-{unknown}", suffix: "" };
    expect(outputNameFor(imageFile("Hero.png", "image/png"), 0, settings)).toBe("hero.png");
  });
});

describe("uniqueNames", () => {
  it("deduplicates repeated output names", () => {
    expect(uniqueNames(["a.jpg", "a.jpg", "b.jpg", "a.jpg"])).toEqual(["a.jpg", "a-2.jpg", "b.jpg", "a-3.jpg"]);
  });

  it("avoids collisions with existing numbered and case-variant names", () => {
    expect(uniqueNames(["hero.jpg", "hero.jpg", "hero-2.jpg", "HERO.JPG"]))
      .toEqual(["hero.jpg", "hero-2.jpg", "hero-2-2.jpg", "HERO-3.JPG"]);
  });
});

describe("folder-preserving paths", () => {
  it("preserves safe nested directories and rejects traversal segments", () => {
    expect(archivePathFor("products/2026/hero.png", "hero.webp", true)).toBe("products/2026/hero.webp");
    expect(archivePathFor("../unsafe/<draft>/hero.png", "hero.webp", true)).toBe("unsafe/-draft-/hero.webp");
    expect(archivePathFor("products/hero.png", "hero.webp", false)).toBe("hero.webp");
  });

  it("deduplicates names within a directory but permits matches across directories", () => {
    expect(uniqueNamesByDirectory(
      ["hero.jpg", "hero.jpg", "hero.jpg"],
      ["one/hero.png", "two/hero.png", "one/copy.png"],
      true
    )).toEqual(["hero.jpg", "hero.jpg", "hero-2.jpg"]);
  });
});
