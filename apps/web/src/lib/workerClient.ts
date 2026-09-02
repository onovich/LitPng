import type { WorkerRequest, WorkerResponse } from "./types";

type ProcessRequest = Extract<WorkerRequest, { type: "process" }>;
type ProcessResponse = Extract<WorkerResponse, { type: "done" | "failed" }>;

// Every job settles, including codec startup errors and a hung worker.
export function requestProcessing(
  worker: Worker,
  request: ProcessRequest,
  onFatal: () => void,
  timeoutMs = 120_000,
  signal?: AbortSignal
): Promise<ProcessResponse> {
  return new Promise((resolve) => {
    let settled = false;
    function finish(response: ProcessResponse, fatal = false) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      worker.removeEventListener("messageerror", onError);
      signal?.removeEventListener("abort", onAbort);
      if (fatal) {
        worker.terminate();
        onFatal();
      }
      resolve(response);
    }
    function fail(error: string) {
      finish({ type: "failed", jobId: request.jobId, error }, true);
    }
    function onMessage(event: MessageEvent<WorkerResponse>) {
      if (event.data.jobId === request.jobId && (event.data.type === "done" || event.data.type === "failed")) {
        finish(event.data);
      }
    }
    function onError() { fail("Image worker failed. Retry this image."); }
    function onAbort() { fail("Image processing interrupted."); }
    const timer = setTimeout(() => fail("Image processing timed out after 120 seconds. Retry this image."), timeoutMs);
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.addEventListener("messageerror", onError);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) { onAbort(); return; }
    try {
      worker.postMessage(request);
    } catch {
      onError();
    }
  });
}
