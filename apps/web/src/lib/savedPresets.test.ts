import { describe, expect, it } from "vitest";
import { MAX_SAVED_PRESETS, parseSavedPresets, upsertSavedPreset } from "./savedPresets";
import { settingsForPreset } from "./types";

describe("saved presets", () => {
  it("loads legacy single-size presets and copies multi-size arrays", () => {
    const settings = settingsForPreset("jpg");
    delete settings.outputWidths;
    const old = { id: "old", name: "Legacy", settings, updatedAt: "now" };
    expect(parseSavedPresets(JSON.stringify([old]))[0].settings.outputWidths).toEqual([]);
    const widths = [128, 256];
    const result = upsertSavedPreset([], "Responsive", { ...settings, outputWidths: widths }, "new", "now");
    widths.push(512);
    expect(result.saved.settings.outputWidths).toEqual([128, 256]);
    expect(parseSavedPresets(JSON.stringify([{ ...old, settings: { ...settings, outputWidths: [0] } }]))).toEqual([]);
  });
  it("ignores corrupted and structurally invalid storage data", () => {
    expect(parseSavedPresets("not json")).toEqual([]);
    expect(parseSavedPresets(JSON.stringify([{ id: "broken", name: "Broken" }]))).toEqual([]);
  });

  it("round-trips valid settings", () => {
    const preset = {
      id: "one",
      name: " Product photos ",
      settings: settingsForPreset("jpg"),
      updatedAt: "2026-09-03T00:00:00.000Z"
    };

    expect(parseSavedPresets(JSON.stringify([preset]))).toEqual([{ ...preset, name: "Product photos" }]);
  });

  it("updates names case-insensitively instead of creating duplicates", () => {
    const original = upsertSavedPreset([], "Website", settingsForPreset("balanced"), "one", "first");
    const updated = upsertSavedPreset(original.presets, "website", settingsForPreset("jpg"), "two", "second");

    expect(updated.presets).toHaveLength(1);
    expect(updated.saved.id).toBe("one");
    expect(updated.saved.settings.outputFormat).toBe("image/jpeg");
  });

  it("rejects blank names and caps local storage growth", () => {
    expect(() => upsertSavedPreset([], "   ", settingsForPreset("balanced"), "one", "now")).toThrow(
      "preset-name-required"
    );

    let presets = [] as ReturnType<typeof upsertSavedPreset>["presets"];
    for (let index = 0; index < MAX_SAVED_PRESETS + 2; index += 1) {
      presets = upsertSavedPreset(presets, `Preset ${index}`, settingsForPreset("balanced"), String(index), "now").presets;
    }
    expect(presets).toHaveLength(MAX_SAVED_PRESETS);
    expect(presets[0].name).toBe(`Preset ${MAX_SAVED_PRESETS + 1}`);
  });
});


it("persists visual crop anchors and offsets without sharing mutable frame settings", () => {
  const frame = { width: 100, height: 80, offsetX: -20, offsetY: -10 };
  const settings = { ...settingsForPreset("balanced"), cropAnchor: "bottom-right" as const, cropMode: "crop" as const, cropFrame: frame };
  const result = upsertSavedPreset([], "Crop", settings, "crop", "now");
  frame.width = 200;
  expect(result.saved.settings.cropFrame?.width).toBe(100);
  const parsed = parseSavedPresets(JSON.stringify(result.presets));
  expect(parsed[0].settings.cropFrame).toEqual({ width: 100, height: 80, offsetX: -20, offsetY: -10 });
  expect(parsed[0].settings.cropAnchor).toBe("bottom-right");
  for (const invalid of [{ ...frame, width: 0 }, { ...frame, height: 9000 }, { ...frame, offsetX: 40000 }]) {
    expect(parseSavedPresets(JSON.stringify([{ ...result.saved, settings: { ...settings, cropFrame: invalid } }]))).toEqual([]);
  }
});
