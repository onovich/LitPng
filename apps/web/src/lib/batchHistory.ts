import { isImageSettings } from "./savedPresets";
import { settingsForPreset, type ImageJob, type ImageSettings } from "./types";

export const HISTORY_STORAGE_KEY = "littlepng-batch-history-v1";
export const MAX_HISTORY_ENTRIES = 20;

export type BatchHistoryEntry = {
  id: string;
  finishedAt: string;
  completed: number;
  failed: number;
  inputBytes: number;
  outputBytes: number;
  durationMs: number;
  settings: ImageSettings;
};

export type BatchHistoryState = {
  enabled: boolean;
  entries: BatchHistoryEntry[];
};

// Copy only known settings, never arbitrary properties from local storage.
function snapshotSettings(settings: ImageSettings): ImageSettings {
  return Object.fromEntries(
    Object.keys(settingsForPreset("balanced")).map((key) => [key, settings[key as keyof ImageSettings]])
  ) as ImageSettings;
}

export function createBatchHistoryEntry(
  id: string,
  finishedAt: string,
  settings: ImageSettings,
  jobs: ImageJob[],
  durationMs: number
): BatchHistoryEntry | undefined {
  const completed = jobs.filter((job) => job.status === "done" && job.result);
  const failed = jobs.filter((job) => job.status === "failed");
  if (completed.length + failed.length === 0) return undefined;

  return {
    id,
    finishedAt,
    completed: completed.length,
    failed: failed.length,
    // Comparing only successful pairs avoids counting failed files as savings.
    inputBytes: completed.reduce((sum, job) => sum + job.sourceSize, 0),
    outputBytes: completed.reduce((sum, job) => sum + job.result!.size, 0),
    durationMs: Math.max(0, Math.round(durationMs)),
    settings: snapshotSettings(settings)
  };
}

function readEntry(value: unknown): BatchHistoryEntry | undefined {
  if (!value || typeof value !== "object") return undefined;
  const entry = value as Record<string, unknown>;
  if (
    typeof entry.id !== "string" || !entry.id || entry.id.length > 128 ||
    typeof entry.finishedAt !== "string" || !Number.isFinite(Date.parse(entry.finishedAt)) ||
    !isImageSettings(entry.settings)
  ) return undefined;

  for (const key of ["completed", "failed", "inputBytes", "outputBytes", "durationMs"] as const) {
    if (!Number.isSafeInteger(entry[key]) || (entry[key] as number) < 0) return undefined;
  }
  const settings = entry.settings;
  if (
    settings.quality < 0 || settings.quality > 1 ||
    settings.maxWidth < 0 || settings.maxHeight < 0 || settings.targetSizeKb < 0 ||
    [settings.renamePattern, settings.prefix, settings.suffix, settings.background].some((text) => text.length > 4096)
  ) return undefined;

  const valid = entry as BatchHistoryEntry;
  if (valid.completed + valid.failed === 0) return undefined;
  return {
    id: valid.id,
    finishedAt: new Date(valid.finishedAt).toISOString(),
    completed: valid.completed,
    failed: valid.failed,
    inputBytes: valid.inputBytes,
    outputBytes: valid.outputBytes,
    durationMs: valid.durationMs,
    settings: snapshotSettings(settings)
  };
}

export function parseBatchHistory(raw: string | null): BatchHistoryState {
  const empty: BatchHistoryState = { enabled: false, entries: [] };
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return empty;
    const data = value as Record<string, unknown>;
    if (data.version !== 1 || typeof data.enabled !== "boolean" || !Array.isArray(data.entries)) return empty;
    const entries: BatchHistoryEntry[] = [];
    const ids = new Set<string>();
    for (const candidate of data.entries) {
      const entry = readEntry(candidate);
      if (entry && !ids.has(entry.id)) {
        entries.push(entry);
        ids.add(entry.id);
      }
      if (entries.length === MAX_HISTORY_ENTRIES) break;
    }
    return { enabled: data.enabled, entries };
  } catch {
    return empty;
  }
}

export function serializeBatchHistory(state: BatchHistoryState): string {
  return JSON.stringify({ version: 1, ...state, entries: state.entries.slice(0, MAX_HISTORY_ENTRIES) });
}
