import { describe, expect, it } from "vitest";
import { MAX_SAVED_PRESETS, parseSavedPresets, upsertSavedPreset } from "./savedPresets";
import { settingsForPreset } from "./types";

describe("saved presets", () => {
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
