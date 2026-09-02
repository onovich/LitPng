import { describe, expect, it } from "vitest";
import { createBatchHistoryEntry, MAX_HISTORY_ENTRIES, parseBatchHistory, serializeBatchHistory } from "./batchHistory";
import { settingsForPreset, type ImageJob } from "./types";

const settings = settingsForPreset("jpg");
const failed: ImageJob = {
  id: "private-id", file: new File(["private pixels"], "private.png"), sourceName: "private.png",
  sourceRelativePath: "private-folder/private.png", outputName: "private-output.jpg", sourceSize: 1000,
  sourceType: "image/png", status: "failed", progress: 0, error: "Private error"
};
const completed: ImageJob = {
  ...failed, status: "done", error: undefined,
  result: {
    name: "private-output.jpg", blob: new Blob(["private bytes"]), type: "image/jpeg", width: 10, height: 10,
    size: 600, durationMs: 50, archivePath: "private-folder/private-output.jpg", qualityUsed: 0.78,
    encodeAttempts: 1, outcome: "converted"
  }
};
const entry = createBatchHistoryEntry("batch", "2026-09-03T00:00:00.000Z", settings, [completed, failed], 200)!;

describe("batch history", () => {
  it("stores counts and successful input/output pairs without source information", () => {
    expect(entry).toMatchObject({ completed: 1, failed: 1, inputBytes: 1000, outputBytes: 600, durationMs: 200 });
    const serialized = serializeBatchHistory({ enabled: true, entries: [entry] });
    expect(serialized).not.toContain("private");
    expect(serialized).not.toContain("Private error");
    expect(serialized).not.toContain("blob");
    expect(parseBatchHistory(serialized)).toEqual({ enabled: true, entries: [entry] });
  });

  it("snapshots settings and excludes unknown properties", () => {
    const mutable = { ...settings, sourceName: "must-not-persist" };
    const snapshot = createBatchHistoryEntry("one", entry.finishedAt, mutable, [completed], 1)!;
    mutable.quality = 0.45;
    expect(snapshot.settings.quality).toBe(0.78);
    expect(snapshot.settings).not.toHaveProperty("sourceName");
    const parsed = parseBatchHistory(JSON.stringify({ version: 1, enabled: true, entries: [{ ...snapshot, file: "secret" }] }));
    expect(parsed.entries[0]).not.toHaveProperty("file");
  });

  it("does not record no-op queues, but records all-failed batches without fake savings", () => {
    expect(createBatchHistoryEntry("one", entry.finishedAt, settings, [], 10)).toBeUndefined();
    expect(createBatchHistoryEntry("one", entry.finishedAt, settings, [{ ...failed, status: "queued" }], 10)).toBeUndefined();
    expect(createBatchHistoryEntry("one", entry.finishedAt, settings, [failed], 10)).toMatchObject({
      completed: 0, failed: 1, inputBytes: 0, outputBytes: 0
    });
  });

  it("defaults to opt-out for corrupt or unknown storage versions", () => {
    for (const raw of [null, "{broken", "[]", '{"version":2,"enabled":true,"entries":[]}']) {
      expect(parseBatchHistory(raw)).toEqual({ enabled: false, entries: [] });
    }
  });

  it("isolates invalid entries and rejects coerced enum values", () => {
    const raw = JSON.stringify({ version: 1, enabled: true, entries: [
      { ...entry, finishedAt: "not-a-date" },
      { ...entry, completed: -1 },
      { ...entry, settings: { ...settings, quality: 100 } },
      { ...entry, settings: { ...settings, cropMode: ["fit"] } },
      entry, entry
    ] });
    expect(parseBatchHistory(raw).entries).toEqual([entry]);
  });

  it("bounds retained history on both read and write", () => {
    const entries = Array.from({ length: MAX_HISTORY_ENTRIES + 10 }, (_, index) => ({ ...entry, id: String(index) }));
    expect(parseBatchHistory(JSON.stringify({ version: 1, enabled: true, entries })).entries).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(JSON.parse(serializeBatchHistory({ enabled: true, entries })).entries).toHaveLength(MAX_HISTORY_ENTRIES);
  });
});
