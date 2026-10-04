import type { ImageJob, ProcessedImage } from "./types";

export type ResponsiveImage = {
  sourceName: string;
  type: string;
  candidates: ProcessedImage[];
};

// Only completed multi-size artifacts qualify. Different output formats remain
// separate, including a retained original alongside converted variants.
export function responsiveImages(jobs: ImageJob[]): ResponsiveImage[] {
  const groups = new Map<string, ResponsiveImage>();
  for (const job of jobs) {
    const result = job.result;
    if (job.status !== "done" || job.variantWidth === undefined || !result ||
      !Number.isSafeInteger(result.width) || result.width <= 0 ||
      !Number.isSafeInteger(result.height) || result.height <= 0) continue;
    const key = JSON.stringify([job.sourceGroupId ?? job.id, result.type]);
    const group = groups.get(key) ?? { sourceName: job.sourceName, type: result.type, candidates: [] };
    const existing = group.candidates.findIndex((item) => item.width === result.width);
    if (existing === -1) group.candidates.push(result);
    else if (result.size < group.candidates[existing].size) group.candidates[existing] = result;
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    ...group, candidates: [...group.candidates].sort((a, b) => a.width - b.width)
  }));
}

function attribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Segment encoding protects spaces, commas, query/hash characters, and Unicode.
// The explicit relative prefix also prevents a filename becoming a URL scheme.
function imageUrl(path: string): string {
  return `./${path.split("/").map((segment) => encodeURIComponent(segment)).join("/")}`;
}

export function srcsetMarkup(groups: ResponsiveImage[], sizes = "100vw"): string {
  return groups.map(({ candidates }) => {
    const largest = candidates[candidates.length - 1];
    const srcset = candidates.map((item) => `${imageUrl(item.archivePath)} ${item.width}w`).join(",\n    ");
    return `<img\n  src="${attribute(imageUrl(largest.archivePath))}"\n  srcset="${attribute(srcset)}"\n  sizes="${attribute(sizes.trim() || "100vw")}"\n  width="${largest.width}"\n  height="${largest.height}"\n  alt=""\n>`;
  }).join("\n\n");
}
