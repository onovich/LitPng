import type { ImageSettings } from "./types";

export const SAVED_PRESETS_STORAGE_KEY = "littlepng-saved-presets-v1";
export const MAX_SAVED_PRESETS = 20;

export type SavedPreset = {
  id: string;
  name: string;
  settings: ImageSettings;
  updatedAt: string;
};

const compressionModes = new Set(["lossless", "lossy"]);
const outputFormats = new Set(["original", "image/jpeg", "image/png", "image/webp"]);
const cropModes = new Set(["fit", "fill", "crop"]);
const cropAnchors = new Set(["center", "top", "bottom", "left", "right"]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isImageSettings(value: unknown): value is ImageSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.compressionMode === "string" && compressionModes.has(settings.compressionMode) &&
    typeof settings.outputFormat === "string" && outputFormats.has(settings.outputFormat) &&
    isFiniteNumber(settings.quality) &&
    isFiniteNumber(settings.targetSizeKb) &&
    typeof settings.preserveFolders === "boolean" &&
    typeof settings.renamePattern === "string" &&
    typeof settings.prefix === "string" &&
    typeof settings.suffix === "string" &&
    typeof settings.lowercase === "boolean" &&
    typeof settings.hyphenate === "boolean" &&
    typeof settings.stripSpecial === "boolean" &&
    isFiniteNumber(settings.maxWidth) &&
    isFiniteNumber(settings.maxHeight) &&
    typeof settings.cropMode === "string" && cropModes.has(settings.cropMode) &&
    typeof settings.cropAnchor === "string" && cropAnchors.has(settings.cropAnchor) &&
    typeof settings.background === "string"
  );
}

function isSavedPreset(value: unknown): value is SavedPreset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const preset = value as Record<string, unknown>;
  return (
    typeof preset.id === "string" &&
    preset.id.length > 0 &&
    typeof preset.name === "string" &&
    preset.name.trim().length > 0 &&
    typeof preset.updatedAt === "string" &&
    isImageSettings(preset.settings)
  );
}

export function parseSavedPresets(raw: string | null): SavedPreset[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedPreset).slice(0, MAX_SAVED_PRESETS).map((preset) => ({
      ...preset,
      name: preset.name.trim().slice(0, 40),
      settings: { ...preset.settings }
    }));
  } catch {
    return [];
  }
}

export function upsertSavedPreset(
  presets: SavedPreset[],
  name: string,
  settings: ImageSettings,
  id: string,
  updatedAt: string
): { presets: SavedPreset[]; saved: SavedPreset } {
  const normalizedName = name.trim().slice(0, 40);
  if (!normalizedName) {
    throw new Error("preset-name-required");
  }

  const existing = presets.find((preset) => preset.name.localeCompare(normalizedName, undefined, { sensitivity: "accent" }) === 0);
  const saved: SavedPreset = {
    id: existing?.id ?? id,
    name: normalizedName,
    settings: { ...settings },
    updatedAt
  };
  const remaining = presets.filter((preset) => preset.id !== saved.id);

  return { presets: [saved, ...remaining].slice(0, MAX_SAVED_PRESETS), saved };
}
