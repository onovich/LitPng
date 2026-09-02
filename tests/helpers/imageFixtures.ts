import { deflateSync } from "node:zlib";

export const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export type PngFixtureKind = "ui" | "gradient";

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function fixtureColor(
  kind: PngFixtureKind,
  x: number,
  y: number,
  width: number,
  height: number
): number[] {
  if (kind === "gradient") {
    return [
      Math.round((x / Math.max(1, width - 1)) * 255),
      Math.round((y / Math.max(1, height - 1)) * 255),
      Math.round(((x + y) / Math.max(1, width + height - 2)) * 255),
      255
    ];
  }

  const colors = [
    [230, 48, 78, 255],
    [30, 150, 245, 255],
    [255, 205, 50, 180],
    [20, 25, 35, 0]
  ];
  return colors[(Math.floor(x / 32) + Math.floor(y / 32)) % colors.length];
}

export function fixturePng(
  kind: PngFixtureKind,
  width = 512,
  height = 512,
  compressionLevel: 0 | 6 = 6
): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);

  const rows = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    rows[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      rows.set(fixtureColor(kind, x, y, width, height), rowStart + 1 + x * 4);
    }
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(rows, { level: compressionLevel })),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

export function transparentFixturePng(width = 256, height = 256): Buffer {
  return fixturePng("ui", width, height, 0);
}

export function pngChunkTypes(bytes: Buffer): string[] {
  const types: string[] = [];
  let offset = PNG_SIGNATURE.length;

  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    types.push(bytes.toString("ascii", offset + 4, offset + 8));
    offset += 12 + length;
  }

  return types;
}
