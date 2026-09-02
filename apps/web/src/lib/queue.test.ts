import { describe, expect, it } from "vitest";
import { createQueueController, runWithConcurrency } from "./queue";

describe("runWithConcurrency", () => {
  it("processes every item", async () => {
    const completed: number[] = [];
    await runWithConcurrency([1, 2, 3, 4], 2, async (item) => {
      completed.push(item);
    });

    expect(completed.sort()).toEqual([1, 2, 3, 4]);
  });

  it("never exceeds the requested concurrency", async () => {
    let active = 0;
    let maxActive = 0;

    await runWithConcurrency([1, 2, 3, 4, 5], 2, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;
    });

    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("waits while paused and processes all remaining items on resume", async () => {
    const controller = createQueueController();
    const completed: number[] = [];
    controller.pause();
    const run = runWithConcurrency([1, 2, 3], 1, async (item) => { completed.push(item); }, controller);
    await Promise.resolve();
    expect(completed).toEqual([]);
    controller.resume();
    await run;
    expect(completed).toEqual([1, 2, 3]);
  });

  it("cancels scheduling but lets the current item finish", async () => {
    const controller = createQueueController();
    const completed: number[] = [];
    await runWithConcurrency([1, 2, 3], 1, async (item) => {
      controller.cancel();
      await Promise.resolve();
      completed.push(item);
    }, controller);
    expect(completed).toEqual([1]);
  });

  it("stopping a paused queue releases its waiters", async () => {
    const controller = createQueueController();
    controller.pause();
    const completed: number[] = [];
    const run = runWithConcurrency([1, 2], 2, async (item) => { completed.push(item); }, controller);
    controller.cancel();
    await run;
    expect(completed).toEqual([]);
  });

  it("handles large queues and non-finite concurrency without dropping jobs", async () => {
    let completed = 0;
    await runWithConcurrency(Array.from({ length: 5000 }, (_, index) => index), NaN, async () => { completed += 1; });
    expect(completed).toBe(5000);
  });
});
