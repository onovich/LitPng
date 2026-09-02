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

type OutputNameContext = {
  relativePath?: string;
};

function folderFor(file: File, relativePath?: string): string {
  const path = relativePath || file.webkitRelativePath || file.name;
  const parts = path.split(/[\\/]+/).filter(Boolean);
  return parts.length > 1 ? parts.at(-2)! : "root";
}

function dateFor(file: File): string {
  const date = new Date(file.lastModified);
  if (Number.isNaN(date.getTime())) {
    return "undated";
  }

  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function outputNameFor(
  file: File,
  index: number,
  settings: ImageSettings,
  context: OutputNameContext = {}
): string {
  const { stem } = splitName(file.name);
  const original = cleanStem(stem, settings);
  const prefix = cleanStem(settings.prefix || "image", settings);
  const suffix = settings.suffix ? cleanStem(settings.suffix, settings) : "";
  const serial = String(index + 1).padStart(3, "0");
  const folder = cleanStem(folderFor(file, context.relativePath), settings);
  const date = dateFor(file);

  let name = settings.renamePattern
    .replaceAll("{original}", original)
    .replaceAll("{prefix}", prefix)
    .replaceAll("{suffix}", suffix)
    .replaceAll("{index}", serial)
    .replaceAll("{folder}", folder)
    .replaceAll("{date}", date)
    .replace(/\{[^}]+\}/g, "");

  if (!settings.renamePattern.includes("{suffix}") && suffix) {
    name = `${name}-${suffix}`;
  }

  name = cleanStem(name, settings);
  return `${name}.${extensionFor(file, settings.outputFormat)}`;
}

function deduplicateNames(names: string[], scopes: string[]): string[] {
  const used = new Set<string>();

  return names.map((name, index) => {
    const scope = scopes[index] ?? "";
    const { stem, extension } = splitName(name);
    let candidate = name;
    let serial = 2;
    let key = `${scope}\u0000${candidate}`.toLocaleLowerCase();

    while (used.has(key)) {
      candidate = `${stem}-${serial}.${extension}`;
      serial += 1;
      key = `${scope}\u0000${candidate}`.toLocaleLowerCase();
    }

    used.add(key);
    return candidate;
  });
}

export function uniqueNames(names: string[]): string[] {
  return deduplicateNames(names, names.map(() => ""));
}

function safeDirectory(relativePath?: string): string {
  if (!relativePath) {
    return "";
  }

  return relativePath
    .split(/[\\/]+/)
    .slice(0, -1)
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .map((segment) => segment
      .replace(/[<>:"|?*\u0000-\u001f]/g, "-")
      .replace(/[. ]+$/g, "")
      .trim() || "folder")
    .join("/");
}

export function archivePathFor(relativePath: string | undefined, outputName: string, preserveFolders: boolean): string {
  const directory = preserveFolders ? safeDirectory(relativePath) : "";
  return directory ? `${directory}/${outputName}` : outputName;
}

export function uniqueNamesByDirectory(
  names: string[],
  relativePaths: Array<string | undefined>,
  preserveFolders: boolean
): string[] {
  if (!preserveFolders) {
    return uniqueNames(names);
  }

  return deduplicateNames(names, relativePaths.map(safeDirectory));
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
