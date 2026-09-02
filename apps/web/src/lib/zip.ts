import { zipSync } from "fflate";
import type { ImageJob } from "./types";

export async function zipCompletedJobs(jobs: ImageJob[]): Promise<Blob> {
  const entries: Record<string, Uint8Array> = {};

  for (const job of jobs) {
    if (!job.result) {
      continue;
    }

    entries[job.result.archivePath] = new Uint8Array(await job.result.blob.arrayBuffer());
  }

  return new Blob([zipSync(entries)], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
