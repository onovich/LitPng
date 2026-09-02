import { describe, expect, it } from "vitest";
import { compressionReportCsv } from "./report";
import type { ImageJob } from "./types";

function sourceFile(name: string) {
  return new File([new Uint8Array(1_000)], name, { type: "image/png" });
}

describe("compressionReportCsv", () => {
  it("reports completed and failed jobs with stable numeric fields", () => {
    const completed: ImageJob = {
      id: "one",
      file: sourceFile("photo.png"),
      sourceName: "photo.png",
      outputName: "photo.jpg",
      sourceSize: 1_000,
      sourceType: "image/png",
      status: "done",
      progress: 100,
      result: {
        name: "photo.jpg",
        blob: new Blob([new Uint8Array(600)], { type: "image/jpeg" }),
        type: "image/jpeg",
        width: 100,
        height: 100,
        size: 600,
        durationMs: 45,
        archivePath: "photo.jpg",
        qualityUsed: 0.725,
        encodeAttempts: 5,
        targetReached: true,
        outcome: "converted"
      }
    };
    const failed: ImageJob = {
      id: "two",
      file: sourceFile("broken.png"),
      sourceName: "broken.png",
      outputName: "broken.png",
      sourceSize: 1_000,
      sourceType: "image/png",
      status: "failed",
      progress: 0,
      error: "Decode failed"
    };

    const report = compressionReportCsv([completed, failed]);
    expect(report).toContain("photo.png,photo.jpg,image/png,image/jpeg,1000,600,400,40,45,converted,0.725,5,true,");
    expect(report).toContain("broken.png,broken.png,image/png,,1000,,,,,failed,,,,Decode failed");
  });

  it("escapes CSV delimiters and spreadsheet formula prefixes", () => {
    const job: ImageJob = {
      id: "unsafe",
      file: sourceFile("=SUM(1,2).png"),
      sourceName: "=SUM(1,2).png",
      outputName: "+output.png",
      sourceSize: 1_000,
      sourceType: "image/png",
      status: "failed",
      progress: 0,
      error: "line one\nline two"
    };

    const report = compressionReportCsv([job]);
    expect(report).toContain("\"'=SUM(1,2).png\",'+output.png");
    expect(report).toContain("\"line one\nline two\"");
  });
});
