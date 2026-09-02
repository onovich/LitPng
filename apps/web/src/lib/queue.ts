export function createQueueController() {
  let paused = false;
  let cancelled = false;
  const listeners = new Set<() => void>();
  function wake() {
    listeners.forEach((resolve) => resolve());
    listeners.clear();
  }
  return {
    pause() { if (!cancelled) paused = true; },
    resume() { paused = false; wake(); },
    cancel() { cancelled = true; wake(); },
    get cancelled() { return cancelled; },
    async waitUntilReady(): Promise<boolean> {
      while (paused && !cancelled) {
        await new Promise<void>((resolve) => listeners.add(resolve));
      }
      return !cancelled;
    }
  };
}

export type QueueController = ReturnType<typeof createQueueController>;

export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  runItem: (item: T, index: number) => Promise<void>,
  controller?: QueueController
): Promise<void> {
  const workerCount = Math.max(1, Math.min(Number.isFinite(concurrency) ? Math.floor(concurrency) : 1, items.length));
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < items.length) {
      if (controller && !(await controller.waitUntilReady())) return;
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= items.length) return;
      await runItem(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => runNext()));
}
