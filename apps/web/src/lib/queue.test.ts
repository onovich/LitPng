import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "./queue";

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
});
