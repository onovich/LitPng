import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const manifestPath = new URL("../benchmarks/corpus.json", import.meta.url);
const outputDirectory = new URL("../.tmp-benchmark-corpus/", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (!Array.isArray(manifest.images) || manifest.images.length === 0) {
  throw new Error("benchmarks/corpus.json must contain at least one image.");
}

await mkdir(outputDirectory, { recursive: true });
const resolvedImages = [];

for (const image of manifest.images) {
  const required = ["id", "fileName", "mimeType", "downloadUrl", "sourcePage", "license"];
  for (const field of required) {
    if (!image[field]) {
      throw new Error(`Corpus entry is missing ${field}: ${JSON.stringify(image)}`);
    }
  }

  const checksum = image.sha256
    ? { algorithm: "sha256", expected: image.sha256 }
    : image.sha1
      ? { algorithm: "sha1", expected: image.sha1 }
      : null;
  if (!checksum) {
    throw new Error(`Corpus entry must provide sha256 or sha1: ${image.id}`);
  }

  const downloadUrl = new URL(image.downloadUrl);
  if (downloadUrl.protocol !== "https:") {
    throw new Error(`Corpus download must use HTTPS: ${image.downloadUrl}`);
  }

  console.log(`Downloading ${image.id} from ${downloadUrl.hostname}...`);
  const response = await fetch(downloadUrl, {
    headers: { "User-Agent": "LittlePNG benchmark corpus fetcher/0.1" }
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${image.id}: HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const actualChecksum = createHash(checksum.algorithm).update(bytes).digest("hex");
  if (actualChecksum !== checksum.expected) {
    throw new Error(
      `Checksum mismatch for ${image.id}: expected ${checksum.algorithm} ${checksum.expected}, ` +
      `received ${actualChecksum}. ` +
      "Review the source before updating the manifest."
    );
  }

  const destination = new URL(image.fileName, outputDirectory);
  await writeFile(destination, bytes);
  resolvedImages.push({
    ...image,
    bytes: bytes.length,
    verifiedChecksum: `${checksum.algorithm}:${actualChecksum}`,
    localPath: path.join(".tmp-benchmark-corpus", image.fileName)
  });
}

await writeFile(
  new URL("manifest.json", outputDirectory),
  JSON.stringify({ fetchedAt: new Date().toISOString(), images: resolvedImages }, null, 2),
  "utf8"
);

console.log(`Verified ${resolvedImages.length} benchmark corpus images.`);
