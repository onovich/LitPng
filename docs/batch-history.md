# Local batch history

History is off by default. Enabling **Remember future batches in this browser**
records up to 20 completed batch attempts on the current browser origin. Each
entry contains a completion timestamp, elapsed time, success/failure counts,
successful-file byte totals, and the exact settings snapshot used for that run.

No source filenames, directory paths, error messages, images, previews, or output
blobs are recorded. User-entered naming templates, prefixes, and suffixes are
part of the saved settings. The data never leaves the browser. Clearing site data
also removes the history; it is not synchronized across devices.

**Reuse settings** applies the stored settings to future work and queued files.
It does not restore images or downloads; add the original files again to rerun a
batch. Already-completed queue results are unchanged. A run with no queued or
failed jobs does not create an entry. Retries are separate batch attempts.

Disabling recording retains existing history but stops recording new runs.
Both disabling and clearing invalidate in-flight recording, even if recording
is re-enabled before that batch finishes. Single-record deletion and clearing
all history are permanent. If storage fails, a visible error is shown and image
processing continues; failed storage mutations are not reported as successful.

The versioned local-storage reader rejects malformed envelopes, invalid entries,
duplicate IDs, and invalid dates/counts/settings, and strips unknown fields. The reader and
writer both enforce the 20-entry cap. A storage event updates other open tabs;
simultaneous writes are best-effort local storage, not a transactional database.
