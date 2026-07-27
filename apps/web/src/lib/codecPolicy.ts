export type JpegContentProfile = "photo" | "graphics";

export type JpegEncodingOptions = {
  quality: number;
  progressive: boolean;
  optimize_coding: boolean;
  quant_table: number;
  trellis_multipass: boolean;
  trellis_opt_zero: boolean;
  trellis_opt_table: boolean;
  trellis_loops: number;
  auto_subsample: boolean;
  chroma_subsample: number;
};

export type PngQuantizationOptions = {
  minQuality: number;
  targetQuality: number;
  speed: number;
};

function percentage(quality: number): number {
  return Math.round(Math.min(1, Math.max(0, quality)) * 100);
}

export function jpegContentProfile(inputType: string): JpegContentProfile {
  return inputType === "image/png" ? "graphics" : "photo";
}

export function jpegEncodingOptions(inputType: string, quality: number): JpegEncodingOptions {
  const profile = jpegContentProfile(inputType);

  return {
    quality: percentage(quality),
    progressive: true,
    optimize_coding: true,
    quant_table: 3,
    trellis_multipass: true,
    trellis_opt_zero: true,
    trellis_opt_table: true,
    trellis_loops: 2,
    auto_subsample: profile === "photo",
    chroma_subsample: profile === "photo" ? 2 : 1
  };
}

export function pngQuantizationOptions(quality: number): PngQuantizationOptions {
  const targetQuality = percentage(quality);

  return {
    minQuality: Math.max(0, targetQuality - 15),
    targetQuality,
    speed: 4
  };
}
