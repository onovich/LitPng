export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  runItem: (item: T, index: number) => Promise<void>
): Promise<void> {
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    const currentIndex = nextIndex;
    nextIndex += 1;

    if (currentIndex >= items.length) {
      return;
    }

    await runItem(items[currentIndex], currentIndex);
    await runNext();
  }

  await Promise.all(Array.from({ length: workerCount }, () => runNext()));
}
