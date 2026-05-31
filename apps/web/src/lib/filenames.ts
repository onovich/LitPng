import type { ImageSettings, OutputFormat } from "./types";

const EXTENSIONS: Record<Exclude<OutputFormat, "original">, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function splitName(filename: string): { stem: string; extension: string } {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) {
    return { stem: filename, extension: "" };
  }

  return {
    stem: filename.slice(0, lastDot),
    extension: filename.slice(lastDot + 1)
  };
}

export function cleanStem(value: string, settings: ImageSettings): string {
  let next = value.trim();

  if (settings.lowercase) {
    next = next.toLowerCase();
  }

  if (settings.hyphenate) {
    next = next.replace(/\s+/g, "-").replace(/_+/g, "-");
  }

  if (settings.stripSpecial) {
    next = next.replace(/[^a-z0-9.-]+/gi, "-");
  }

  next = next.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return next || "image";
}

export function extensionFor(file: File, outputFormat: OutputFormat): string {
  if (outputFormat !== "original") {
    return EXTENSIONS[outputFormat];
  }

  const { extension } = splitName(file.name);
  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "img";
}

export function outputNameFor(file: File, index: number, settings: ImageSettings): string {
  const { stem } = splitName(file.name);
  const original = cleanStem(stem, settings);
  const prefix = cleanStem(settings.prefix || "image", settings);
  const suffix = settings.suffix ? cleanStem(settings.suffix, settings) : "";
  const serial = String(index + 1).padStart(3, "0");

  let name = settings.renamePattern
    .replaceAll("{original}", original)
    .replaceAll("{prefix}", prefix)
    .replaceAll("{suffix}", suffix)
    .replaceAll("{index}", serial);

  if (!settings.renamePattern.includes("{suffix}") && suffix) {
    name = `${name}-${suffix}`;
  }

  name = cleanStem(name, settings);
  return `${name}.${extensionFor(file, settings.outputFormat)}`;
}

export function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>();

  return names.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);

    if (count === 0) {
      return name;
    }

    const { stem, extension } = splitName(name);
    return `${stem}-${count + 1}.${extension}`;
  });
}

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unit]}`;
}
