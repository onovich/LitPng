import type { ImageJob } from "./types";

const HEADERS = [
  "source_name", "output_name", "source_type", "output_type",
  "source_bytes", "output_bytes", "saved_bytes", "saved_percent",
  "duration_ms", "outcome", "quality_used", "encode_attempts",
  "target_reached", "error"
];

function csvCell(value: string | number | boolean | undefined): string {
  let text = value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function compressionReportCsv(jobs: ImageJob[]): string {
  const rows = jobs.map((job) => {
    const result = job.result;
    const outputBytes = result?.size;
    const savedBytes = outputBytes === undefined ? undefined : job.sourceSize - outputBytes;
    const savedPercent = savedBytes === undefined || job.sourceSize === 0
      ? undefined
      : Number(((savedBytes / job.sourceSize) * 100).toFixed(2));

    return [
      job.sourceName,
      result?.name ?? job.outputName,
      job.sourceType,
      result?.type,
      job.sourceSize,
      outputBytes,
      savedBytes,
      savedPercent,
      result?.durationMs,
      result?.outcome ?? job.status,
      result ? Number(result.qualityUsed.toFixed(3)) : undefined,
      result?.encodeAttempts,
      result?.targetReached,
      job.error
    ].map(csvCell).join(",");
  });

  return `\uFEFF${[HEADERS.join(","), ...rows].join("\r\n")}\r\n`;
}

export function compressionReportBlob(jobs: ImageJob[]): Blob {
  return new Blob([compressionReportCsv(jobs)], { type: "text/csv;charset=utf-8" });
}
