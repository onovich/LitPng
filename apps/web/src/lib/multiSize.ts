import { archivePathFor, outputNameFor, splitName } from "./filenames";
import type { ImageJob, ImageSettings } from "./types";

export const MAX_OUTPUT_WIDTHS = 6;
export const MAX_OUTPUT_WIDTH = 8192;

export function isValidOutputWidths(value: unknown): value is number[] | undefined {
  return value === undefined || (
    Array.isArray(value) && value.length <= MAX_OUTPUT_WIDTHS &&
    value.every((width) => Number.isInteger(width) && width >= 1 && width <= MAX_OUTPUT_WIDTH) &&
    new Set(value).size === value.length
  );
}

export function settingsForOutput(job: ImageJob, settings: ImageSettings): ImageSettings {
  return job.variantWidth === undefined ? settings : {
    ...settings, cropFrame: undefined, outputWidths: [], maxWidth: job.variantWidth, maxHeight: 0, cropMode: "fit"
  };
}

export function uniqueSourceBytes(jobs: ImageJob[]): number {
  const groups = new Map<string, number>();
  jobs.forEach((job) => groups.set(job.sourceGroupId ?? job.id, job.sourceSize));
  return [...groups.values()].reduce((sum, size) => sum + size, 0);
}

function isFixed(job: ImageJob): boolean {
  return job.status === "done" || job.status === "processing";
}

// Called only for imports/settings edits, never on individual progress updates.
// Finished artifacts keep their names and paths; only pending variants reconcile.
export function reconcileOutputJobs(jobs: ImageJob[], settings: ImageSettings): ImageJob[] {
  const groups = new Map<string, ImageJob[]>();
  for (const job of jobs) {
    const id = job.sourceGroupId ?? job.id;
    const group = groups.get(id) ?? [];
    group.push(job);
    groups.set(id, group);
  }
  const widths: Array<number | undefined> = settings.compressionMode === "lossy" && settings.outputWidths?.length
    ? [...settings.outputWidths].sort((a, b) => a - b)
    : [undefined];
  const output: ImageJob[] = [];
  let sourceIndex = 0;
  for (const [groupId, group] of groups) {
    const source = group[0];
    const serial = source.sourceIndex ?? sourceIndex;
    sourceIndex += 1;
    const fixed = group.filter(isFixed);
    output.push(...fixed);
    if (group.every(isFixed)) continue;

    for (const width of widths) {
      if (fixed.some((job) => job.variantWidth === width)) continue;
      const existing = group.find((job) => !isFixed(job) && job.variantWidth === width);
      const baseName = outputNameFor(source.file, serial, settings, { relativePath: source.sourceRelativePath });
      const { stem, extension } = splitName(baseName);
      output.push({
        ...source,
        id: existing?.id ?? `${groupId}:width:${width ?? "single"}`,
        sourceGroupId: groupId,
        sourceIndex: serial,
        variantWidth: width,
        outputName: width === undefined ? baseName : `${stem}-max${width}w.${extension}`,
        status: "queued", progress: 0, result: undefined, error: undefined
      });
    }
  }

  // Reserve actual completed archive paths before deduplicating new artifacts.
  const used = new Set(output.filter(isFixed).map((job) =>
    (job.result?.archivePath ?? archivePathFor(job.sourceRelativePath, job.outputName, settings.preserveFolders)).toLowerCase()
  ));
  return output.map((job) => {
    if (isFixed(job)) return job;
    const { stem, extension } = splitName(job.outputName);
    let name = job.outputName;
    let serial = 2;
    while (used.has(archivePathFor(job.sourceRelativePath, name, settings.preserveFolders).toLowerCase())) {
      name = `${stem}-${serial}.${extension}`;
      serial += 1;
    }
    used.add(archivePathFor(job.sourceRelativePath, name, settings.preserveFolders).toLowerCase());
    return { ...job, outputName: name };
  });
}
