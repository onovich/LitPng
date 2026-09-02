import { describe, expect, it } from "vitest";
import { publishingPresets, settingsForPublishingPreset } from "./publishingPresets";

describe("publishing presets", () => {
  it("provides unique platform presets", () => {
    expect(publishingPresets.map((preset) => preset.id)).toEqual(["shopify", "wordpress", "open-graph"]);
  });

  it("caps Shopify images without forcing a destructive square crop", () => {
    expect(settingsForPublishingPreset("shopify")).toMatchObject({
      outputFormat: "original",
      maxWidth: 2048,
      maxHeight: 2048,
      cropMode: "fit"
    });
  });

  it("uses WordPress' large-image threshold and WebP output", () => {
    expect(settingsForPublishingPreset("wordpress")).toMatchObject({
      outputFormat: "image/webp",
      maxWidth: 2560,
      maxHeight: 2560,
      cropMode: "fit"
    });
  });

  it("creates a conventional Open Graph sharing card", () => {
    expect(settingsForPublishingPreset("open-graph")).toMatchObject({
      outputFormat: "image/jpeg",
      maxWidth: 1200,
      maxHeight: 630,
      cropMode: "crop"
    });
  });
});
