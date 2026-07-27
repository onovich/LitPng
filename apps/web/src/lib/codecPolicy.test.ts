import { describe, expect, it } from "vitest";
import {
  jpegContentProfile,
  jpegEncodingOptions,
  pngQuantizationOptions
} from "./codecPolicy";

describe("jpegEncodingOptions", () => {
  it("uses the photo profile for JPEG sources", () => {
    expect(jpegContentProfile("image/jpeg")).toBe("photo");
    expect(jpegEncodingOptions("image/jpeg", 0.78)).toMatchObject({
      quality: 78,
      progressive: true,
      optimize_coding: true,
      auto_subsample: true,
      chroma_subsample: 2
    });
  });

  it("preserves full chroma resolution for PNG graphics converted to JPEG", () => {
    expect(jpegContentProfile("image/png")).toBe("graphics");
    expect(jpegEncodingOptions("image/png", 0.82)).toMatchObject({
      quality: 82,
      auto_subsample: false,
      chroma_subsample: 1
    });
  });

  it("clamps quality before passing it to MozJPEG", () => {
    expect(jpegEncodingOptions("image/jpeg", 2).quality).toBe(100);
    expect(jpegEncodingOptions("image/jpeg", -1).quality).toBe(0);
  });
});

describe("pngQuantizationOptions", () => {
  it("keeps a quality floor below the requested target", () => {
    expect(pngQuantizationOptions(0.82)).toEqual({
      minQuality: 67,
      targetQuality: 82,
      speed: 4
    });
  });

  it("clamps quality to imagequant's accepted range", () => {
    expect(pngQuantizationOptions(2)).toEqual({
      minQuality: 85,
      targetQuality: 100,
      speed: 4
    });
    expect(pngQuantizationOptions(-1)).toEqual({
      minQuality: 0,
      targetQuality: 0,
      speed: 4
    });
  });
});
