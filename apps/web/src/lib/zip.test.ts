import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import type { ImageJob, ProcessedImage } from "./types";
import { zipCompletedJobs } from "./zip";

function completedJob(id: string, archivePath: string, byte: number): ImageJob {
  const result: ProcessedImage = {
    name: "hero.png",
    archivePath,
    blob: new Blob([new Uint8Array([byte])], { type: "image/png" }),
    type: "image/png",
    width: 1,
    height: 1,
    size: 1,
    durationMs: 1,
    qualityUsed: 0.82,
    encodeAttempts: 1,
    outcome: "compressed"
  };

  return {
    id,
    file: new File([new Uint8Array([byte])], "hero.png", { type: "image/png" }),
    sourceName: "hero.png",
    outputName: "hero.png",
    sourceSize: 1,
    sourceType: "image/png",
    status: "done",
    progress: 100,
    result
  };
}

describe("zipCompletedJobs", () => {
  it("writes completed images at their preserved archive paths", async () => {
    const zip = await zipCompletedJobs([
      completedJob("one", "catalog/front/hero.png", 1),
      completedJob("two", "catalog/back/hero.png", 2)
    ]);
    const entries = unzipSync(new Uint8Array(await zip.arrayBuffer()));

    expect(Object.keys(entries).sort()).toEqual([
      "catalog/back/hero.png",
      "catalog/front/hero.png"
    ]);
    expect([...entries["catalog/front/hero.png"]]).toEqual([1]);
    expect([...entries["catalog/back/hero.png"]]).toEqual([2]);
  });
});
