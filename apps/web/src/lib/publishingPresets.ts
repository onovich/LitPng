import { settingsForPreset, type ImageSettings } from "./types";

export type PublishingPresetId = "custom" | "shopify" | "wordpress" | "open-graph";

export type PublishingPreset = {
  id: Exclude<PublishingPresetId, "custom">;
  settings: ImageSettings;
};

const base = settingsForPreset("balanced");

export const publishingPresets: PublishingPreset[] = [
  {
    id: "shopify",
    settings: {
      ...base,
      compressionMode: "lossy",
      outputFormat: "original",
      quality: 0.82,
      suffix: "-shopify",
      maxWidth: 2048,
      maxHeight: 2048,
      cropMode: "fit"
    }
  },
  {
    id: "wordpress",
    settings: {
      ...base,
      compressionMode: "lossy",
      outputFormat: "image/webp",
      quality: 0.82,
      suffix: "-wordpress",
      maxWidth: 2560,
      maxHeight: 2560,
      cropMode: "fit"
    }
  },
  {
    id: "open-graph",
    settings: {
      ...base,
      compressionMode: "lossy",
      outputFormat: "image/jpeg",
      quality: 0.85,
      suffix: "-og",
      maxWidth: 1200,
      maxHeight: 630,
      cropMode: "crop"
    }
  }
];

export function settingsForPublishingPreset(id: Exclude<PublishingPresetId, "custom">): ImageSettings {
  const preset = publishingPresets.find((candidate) => candidate.id === id);

  if (!preset) {
    throw new Error(`Unknown publishing preset: ${id}`);
  }

  return { ...preset.settings };
}
