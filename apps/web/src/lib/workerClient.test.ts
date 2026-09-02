import { afterEach, describe, expect, it, vi } from "vitest";
import { requestProcessing } from "./workerClient";
import { settingsForPreset, type WorkerRequest } from "./types";

class FakeWorker extends EventTarget {
  postMessage = vi.fn();
  terminate = vi.fn();
}
const request: Extract<WorkerRequest, { type: "process" }> = {
  type: "process", jobId: "one", file: new File(["data"], "test.png"),
  outputName: "test.jpg", archivePath: "test.jpg", settings: settingsForPreset("jpg")
};
afterEach(() => vi.useRealTimers());

describe("requestProcessing", () => {
  it("ignores other jobs and preview responses", async () => {
    const worker = new FakeWorker();
    const fatal = vi.fn();
    const promise = requestProcessing(worker as unknown as Worker, request, fatal);
    worker.dispatchEvent(new MessageEvent("message", { data: { type: "failed", jobId: "two", error: "wrong" } }));
    worker.dispatchEvent(new MessageEvent("message", { data: { type: "preview-failed", jobId: "one", error: "wrong" } }));
    worker.dispatchEvent(new MessageEvent("message", { data: { type: "failed", jobId: "one", error: "Decode failed" } }));
    expect(await promise).toEqual({ type: "failed", jobId: "one", error: "Decode failed" });
    expect(fatal).not.toHaveBeenCalled();
    worker.dispatchEvent(new Event("error"));
    expect(worker.terminate).not.toHaveBeenCalled();
  });

  it("settles on worker crashes and discards the broken worker once", async () => {
    const worker = new FakeWorker();
    const fatal = vi.fn();
    const promise = requestProcessing(worker as unknown as Worker, request, fatal);
    worker.dispatchEvent(new Event("error"));
    worker.dispatchEvent(new Event("messageerror"));
    expect(await promise).toMatchObject({ type: "failed", jobId: "one" });
    expect(fatal).toHaveBeenCalledTimes(1);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it("bounds hung requests with a timeout", async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const promise = requestProcessing(worker as unknown as Worker, request, vi.fn(), 10);
    await vi.advanceTimersByTimeAsync(10);
    expect(await promise).toMatchObject({ type: "failed", error: expect.stringContaining("timed out") });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it("handles synchronous postMessage failures", async () => {
    const worker = new FakeWorker();
    worker.postMessage.mockImplementation(() => { throw new Error("DataCloneError"); });
    expect(await requestProcessing(worker as unknown as Worker, request, vi.fn())).toMatchObject({ type: "failed" });
  });

  it("settles outstanding requests when the view unmounts", async () => {
    const worker = new FakeWorker();
    const controller = new AbortController();
    const promise = requestProcessing(worker as unknown as Worker, request, vi.fn(), 120_000, controller.signal);
    controller.abort();
    expect(await promise).toMatchObject({ type: "failed", error: "Image processing interrupted." });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });
});
