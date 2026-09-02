# Bounded batch queues

The browser queue now provides pause/resume, graceful stop, batch progress,
50-row pagination, and explicit removal of completed results. Algorithms and
quality settings are unchanged.

## Scheduling and controls

- The UI uses one real processing Worker with one in-flight image. Previously
  the UI displayed two workers but sent concurrent jobs into one shared Worker.
- Metadata decoding is serialized across imports, rather than eagerly decoding
  every file at once. Each bitmap is closed after its dimensions are read.
- Pause/stop lets the active image finish and prevents dispatching another one.
  Stop marks the unstarted jobs cancelled; Run batch retries queued, failed, and
  cancelled jobs, leaving completed results intact.
- Inputs/settings/clear are locked during an active batch, including pauses.
  Stop the batch before changing parameters or adding files. The active run uses
  a fixed settings snapshot.
- Worker crashes, message failures, and 120-second timeouts mark the current
  image failed, dispose of that Worker, and allow subsequent files to use a new
  Worker. Timeouts are conservative safeguards, not automatic quality reduction.
- Unmount aborts outstanding requests. Clear/remove-completed releases result
  references and terminates the retained Worker. Worker bitmaps and canvas
  backing stores are released on both success and failure.

## Retention and limits

Only the current 50 rows are rendered, but all queue files and output blobs are
still retained in browser memory. ZIP construction also needs memory. This is
not a disk-streaming queue and does not promise unlimited image counts/sizes.
For large originals, process manageable batches, download the results, then use
Remove completed. Removal is permanent within the queue; history retains only
statistics/settings, never recoverable downloads. Refreshing does not resume a
queue.

Progress counts terminal responses for the current attempt, including failures.
After a graceful stop it can remain below the total. Optional history records
only the images actually attempted, not the unstarted cancelled files. Savings
compare successful input/output pairs so queued/failed images do not inflate the
saved-byte total.

## Verification

- Scheduler tests cover pause, resume, cancellation, bounds, and 5,000 tasks.
- A Chromium integration test imports and encodes 125 small synthetic images,
  checks metadata decode concurrency and 50/50/25 row pagination, then removes
  completed results. This verifies queue mechanics, not a large-photo RAM budget.
- Real Worker tests cover pause/resume, graceful stop/retry, and recovery from a
  simulated Worker crash. Unit tests cover timeout and abort cleanup.
- Populated/paused controls are checked at 320, 768, 1024, and 1440 px.
