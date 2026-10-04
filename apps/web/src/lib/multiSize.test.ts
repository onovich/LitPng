import { describe, expect, it } from "vitest";
import { createResizeCropPlan } from "./geometry";
import { isValidOutputWidths, reconcileOutputJobs, settingsForOutput, uniqueSourceBytes } from "./multiSize";
import { normalizedSettings } from "./processingPolicy";
import { settingsForPreset, type ImageJob } from "./types";

const settings = { ...settingsForPreset("jpg"), outputWidths: [128, 256, 1024] };
function source(id = "one", name = "photo.png", relativePath?: string): ImageJob {
  return {
    id, file: new File(["pixels"], name), sourceName: name, sourceRelativePath: relativePath,
    sourceSize: 1000, sourceType: "image/png", outputName: name, status: "queued", progress: 0
  };
}
function finish(job: ImageJob, archivePath = job.outputName): ImageJob {
  return { ...job, status: "done", result: {
    name: job.outputName, archivePath, blob: new Blob(["jpeg"]), type: "image/jpeg", width: 128,
    height: 64, size: 400, durationMs: 1, qualityUsed: 0.78, encodeAttempts: 1, outcome: "transformed"
  } };
}

describe("multi-size outputs", () => {
  it("validates bounded unique integer widths and permits old settings without widths", () => {
    for (const value of [undefined, [], [1, 8192], [128, 256]]) expect(isValidOutputWidths(value)).toBe(true);
    for (const value of [null, "128", [128, 128], [0], [-1], [8193], [1.5], [NaN], ["128"], [1, 2, 3, 4, 5, 6, 7]]) {
      expect(isValidOutputWidths(value)).toBe(false);
    }
  });

  it("expands into independently named outputs sharing the original File", () => {
    const input = source();
    const jobs = reconcileOutputJobs([input], settings);
    expect(jobs.map((job) => job.outputName)).toEqual([
      "photo-little-max128w.jpg", "photo-little-max256w.jpg", "photo-little-max1024w.jpg"
    ]);
    expect(new Set(jobs.map((job) => job.id)).size).toBe(3);
    expect(jobs.every((job) => job.file === input.file)).toBe(true);
    expect(uniqueSourceBytes(jobs)).toBe(1000);
    expect(reconcileOutputJobs(jobs, settings)).toEqual(jobs);
  });

  it("keeps source numbering stable across variants", () => {
    const jobs = reconcileOutputJobs([source(), source("two")], { ...settings, renamePattern: "{index}", suffix: "" });
    expect(jobs.map((job) => job.outputName)).toEqual([
      "001-max128w.jpg", "001-max256w.jpg", "001-max1024w.jpg",
      "002-max128w.jpg", "002-max256w.jpg", "002-max1024w.jpg"
    ]);
    expect(uniqueSourceBytes(jobs)).toBe(2000);
  });

  it("preserves finished artifacts and rebuilds only unfinished widths", () => {
    const jobs = reconcileOutputJobs([source()], settings);
    const completed = finish(jobs[0]);
    const stopped = [completed, ...jobs.slice(1).map((job) => ({ ...job, status: "cancelled" as const }))];
    const next = reconcileOutputJobs(stopped, { ...settings, outputWidths: [128, 512], outputFormat: "image/png" });
    expect(next).toHaveLength(2);
    expect(next[0]).toBe(completed);
    expect(next[1].outputName).toBe("photo-little-max512w.png");
    expect(next[1].status).toBe("queued");
    expect(reconcileOutputJobs([completed], settings)).toEqual([completed]);
  });

  it("restores single-output lossless behavior without applying transforms", () => {
    const jobs = reconcileOutputJobs([source()], settings);
    const lossless = normalizedSettings({ ...settings, compressionMode: "lossless" });
    expect(lossless.outputWidths).toEqual([]);
    const [job] = reconcileOutputJobs(jobs, lossless);
    expect(job.variantWidth).toBeUndefined();
    expect(settingsForOutput(job, lossless)).toMatchObject({ maxWidth: 0, maxHeight: 0 });
  });

  it("ignores single-output crop bounds and never upscales", () => {
    const jobs = reconcileOutputJobs([source()], settings);
    const original = { width: 512, height: 256 };
    const plans = jobs.map((job) => createResizeCropPlan(original, settingsForOutput(job, {
      ...settings, maxWidth: 1200, maxHeight: 630, cropMode: "crop"
    })));
    expect(plans.map((plan) => plan.output)).toEqual([
      { width: 128, height: 64 }, { width: 256, height: 128 }, { width: 512, height: 256 }
    ]);
  });

  it("reserves completed archive paths and scopes duplicate names by folder", () => {
    const [job] = reconcileOutputJobs([source("one")], { ...settings, outputWidths: [128] });
    const completed = finish(job);
    const collision = reconcileOutputJobs([source("two"), completed], { ...settings, outputWidths: [128] });
    expect(collision.find((item) => item.status === "queued")?.outputName).toBe("photo-little-max128w-2.jpg");
    expect(collision.find((item) => item.status === "done")).toBe(completed);
    const folders = reconcileOutputJobs([source("one", "photo.png", "a/photo.png"), source("two", "photo.png", "b/photo.png")], {
      ...settings, outputWidths: [128], preserveFolders: true
    });
    expect(folders.map((item) => item.outputName)).toEqual(["photo-little-max128w.jpg", "photo-little-max128w.jpg"]);
  });
});
