import { describe, expect, it } from "vitest";
import { encodeToTargetSize } from "./targetSize";

function sizedBlob(quality: number) {
  return new Blob([new Uint8Array(Math.round(1_000 + quality * 9_000))]);
}

describe("encodeToTargetSize", () => {
  it("keeps maximum quality when it already meets the target", async () => {
    const result = await encodeToTargetSize(async (quality) => sizedBlob(quality), {
      targetBytes: 10_000,
      maxQuality: 0.8
    });

    expect(result.quality).toBe(0.8);
    expect(result.targetReached).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("selects the highest tested quality below the target", async () => {
    const result = await encodeToTargetSize(async (quality) => sizedBlob(quality), {
      targetBytes: 6_000,
      maxQuality: 0.9,
      minQuality: 0.3,
      maxAttempts: 6
    });

    expect(result.blob.size).toBeLessThanOrEqual(6_000);
    expect(result.quality).toBeGreaterThan(0.5);
    expect(result.quality).toBeLessThan(0.6);
    expect(result.targetReached).toBe(true);
    expect(result.attempts).toBe(6);
  });

  it("returns the smallest attempt when the target is unreachable", async () => {
    const result = await encodeToTargetSize(async (quality) => sizedBlob(quality), {
      targetBytes: 500,
      maxQuality: 0.9,
      minQuality: 0.3,
      maxAttempts: 6
    });

    expect(result.quality).toBe(0.3);
    expect(result.blob.size).toBe(3_700);
    expect(result.targetReached).toBe(false);
  });
});
