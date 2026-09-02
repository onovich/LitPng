export type TargetSizeResult = {
  blob: Blob;
  quality: number;
  targetReached: boolean;
  attempts: number;
};

type TargetSizeOptions = {
  targetBytes: number;
  maxQuality: number;
  minQuality?: number;
  maxAttempts?: number;
};

export async function encodeToTargetSize(
  encode: (quality: number) => Promise<Blob>,
  options: TargetSizeOptions
): Promise<TargetSizeResult> {
  const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? 6));
  const maxQuality = Math.min(1, Math.max(0, options.maxQuality));
  const minQuality = Math.min(maxQuality, Math.max(0, options.minQuality ?? 0.35));
  const targetBytes = Math.max(1, Math.floor(options.targetBytes));
  let attempts = 0;

  async function attempt(quality: number) {
    attempts += 1;
    return { blob: await encode(quality), quality };
  }

  const maximum = await attempt(maxQuality);
  if (maximum.blob.size <= targetBytes || maxAttempts === 1) {
    return { ...maximum, targetReached: maximum.blob.size <= targetBytes, attempts };
  }

  let smallest = maximum;
  let bestUnderTarget: { blob: Blob; quality: number } | undefined;
  let low = minQuality;
  let high = maxQuality;

  while (attempts < maxAttempts && high - low >= 0.005) {
    const quality = attempts === 1 ? low : (low + high) / 2;
    const candidate = await attempt(quality);

    if (candidate.blob.size < smallest.blob.size) {
      smallest = candidate;
    }

    if (candidate.blob.size <= targetBytes) {
      if (!bestUnderTarget || candidate.quality > bestUnderTarget.quality) {
        bestUnderTarget = candidate;
      }
      low = quality;
    } else {
      high = quality;
    }
  }

  const selected = bestUnderTarget ?? smallest;
  return { ...selected, targetReached: Boolean(bestUnderTarget), attempts };
}
