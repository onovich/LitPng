import { describe, expect, it } from "vitest";
import { estimateVisualLoss, normalizedSettings, shouldKeepOriginal } from "./processingPolicy";

describe("shouldKeepOriginal", () => {
  it("keeps same-format no-op output when encoding gets larger", () => {
    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 1200,
        inputType: "image/png",
        outputType: "image/png",
        hasPixelTransform: false,
        compressionMode: "lossy"
      })
    ).toBe(true);
  });

  it("keeps same-format no-op output when encoding does not save bytes", () => {
    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 1000,
        inputType: "image/jpeg",
        outputType: "image/jpeg",
        hasPixelTransform: false,
        compressionMode: "lossy"
      })
    ).toBe(true);
  });

  it("uses encoded output when it is smaller", () => {
    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 800,
        inputType: "image/png",
        outputType: "image/png",
        hasPixelTransform: false,
        compressionMode: "lossy"
      })
    ).toBe(false);
  });

  it("uses encoded output for conversions and pixel transforms", () => {
    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 1200,
        inputType: "image/jpeg",
        outputType: "image/png",
        hasPixelTransform: false,
        compressionMode: "lossy"
      })
    ).toBe(false);

    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 1200,
        inputType: "image/png",
        outputType: "image/png",
        hasPixelTransform: true,
        compressionMode: "lossy"
      })
    ).toBe(false);
  });

  it("never introduces new lossy encoding in lossless mode", () => {
    expect(
      shouldKeepOriginal({
        sourceSize: 1000,
        encodedSize: 700,
        inputType: "image/jpeg",
        outputType: "image/jpeg",
        hasPixelTransform: false,
        compressionMode: "lossless"
      })
    ).toBe(true);
  });

  it("normalizes lossless settings to non-lossy controls", () => {
    expect(
      normalizedSettings({
        compressionMode: "lossless",
        outputFormat: "image/jpeg",
        quality: 0.5,
        renamePattern: "{original}",
        prefix: "",
        suffix: "",
        lowercase: true,
        hyphenate: true,
        stripSpecial: true,
        maxWidth: 1200,
        maxHeight: 900,
        cropMode: "crop",
        cropAnchor: "center",
        background: "#ffffff"
      })
    ).toMatchObject({
      outputFormat: "image/png",
      maxWidth: 0,
      maxHeight: 0,
      cropMode: "fit"
    });
  });

  it("estimates zero visual loss for lossless settings", () => {
    expect(
      estimateVisualLoss(
        {
          compressionMode: "lossless",
          outputFormat: "original",
          quality: 0.5,
          renamePattern: "{original}",
          prefix: "",
          suffix: "",
          lowercase: true,
          hyphenate: true,
          stripSpecial: true,
          maxWidth: 0,
          maxHeight: 0,
          cropMode: "fit",
          cropAnchor: "center",
          background: "#ffffff"
        },
        []
      )
    ).toEqual({ percent: 0, label: "None" });
  });
});
