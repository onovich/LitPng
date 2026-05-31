import {
  Archive,
  Download,
  ImagePlus,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  Trash2,
  Type
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ToolPage } from "../data/toolPages";
import { formatBytes, outputNameFor, uniqueNames } from "../lib/filenames";
import { downloadBlob, zipCompletedJobs } from "../lib/zip";
import { settingsForPreset, type ImageJob, type ImageSettings, type WorkerRequest, type WorkerResponse } from "../lib/types";

type Props = {
  pageHeading: string;
  preset: ToolPage["preset"];
};

export default function ImagePrepApp({ pageHeading, preset }: Props) {
  const [settings, setSettings] = useState<ImageSettings>(() => settingsForPreset(preset));
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totals = useMemo(() => {
    const source = jobs.reduce((sum, job) => sum + job.sourceSize, 0);
    const output = jobs.reduce((sum, job) => sum + (job.result?.size ?? 0), 0);
    const completed = jobs.filter((job) => job.status === "done").length;
    const saved = output > 0 ? source - output : 0;
    return { source, output, completed, saved };
  }, [jobs]);

  function updateSettings(next: Partial<ImageSettings>) {
    setSettings((current) => ({ ...current, ...next }));
  }

  function addFiles(fileList: FileList | File[]) {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const rawNames = imageFiles.map((file, index) => outputNameFor(file, jobs.length + index, settings));
    const names = uniqueNames(rawNames);

    setJobs((current) => [
      ...current,
      ...imageFiles.map((file, index) => ({
        id: crypto.randomUUID(),
        file,
        sourceName: file.name,
        outputName: names[index],
        sourceSize: file.size,
        sourceType: file.type || "image/unknown",
        status: "queued" as const,
        progress: 0
      }))
    ]);
  }

  function resetJobs() {
    setJobs([]);
  }

  function getWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("../workers/imageWorker.ts", import.meta.url), { type: "module" });
    }

    return workerRef.current;
  }

  async function processQueue() {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    const worker = getWorker();
    const queuedJobs = jobs.filter((job) => job.status === "queued" || job.status === "failed");

    for (const job of queuedJobs) {
      setJobs((current) =>
        current.map((item) => (item.id === job.id ? { ...item, status: "processing", progress: 35, error: undefined } : item))
      );

      const response = await new Promise<WorkerResponse>((resolve) => {
        const onMessage = (event: MessageEvent<WorkerResponse>) => {
          if (event.data.jobId !== job.id) {
            return;
          }

          worker.removeEventListener("message", onMessage);
          resolve(event.data);
        };

        worker.addEventListener("message", onMessage);
        worker.postMessage({
          type: "process",
          jobId: job.id,
          file: job.file,
          outputName: job.outputName,
          settings
        } satisfies WorkerRequest);
      });

      setJobs((current) =>
        current.map((item) => {
          if (item.id !== job.id) {
            return item;
          }

          if (response.type === "done") {
            return { ...item, status: "done", progress: 100, result: response.result };
          }

          return { ...item, status: "failed", progress: 0, error: response.error };
        })
      );
    }

    setIsProcessing(false);
  }

  async function downloadZip() {
    const blob = await zipCompletedJobs(jobs);
    downloadBlob(blob, "littlepng-export.zip");
  }

  return (
    <main className="appShell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Private batch image prep</p>
          <h1>{pageHeading}</h1>
        </div>
        <div className="metrics" aria-label="Batch summary">
          <span>{jobs.length} files</span>
          <span>{formatBytes(totals.source)}</span>
          <span>{totals.completed} done</span>
        </div>
      </header>

      <section className="workspace">
        <div
          className="dropzone"
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
          onDragOver={(event) => event.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => event.currentTarget.files && addFiles(event.currentTarget.files)}
          />
          <button className="dropButton" type="button" onClick={() => inputRef.current?.click()} title="Add images">
            <ImagePlus aria-hidden="true" />
            <span>Add images</span>
          </button>
          <div className="dropStats">
            <span>PNG</span>
            <span>JPG</span>
            <span>WebP</span>
            <span>Local</span>
          </div>
        </div>

        <aside className="controls" aria-label="Batch controls">
          <div className="controlGroup">
            <div className="controlTitle">
              <Type aria-hidden="true" />
              <span>Rename</span>
            </div>
            <label>
              Pattern
              <select value={settings.renamePattern} onChange={(event) => updateSettings({ renamePattern: event.target.value })}>
                <option value="{original}">Original</option>
                <option value="{original}-{index}">Original + index</option>
                <option value="{prefix}-{index}">Prefix + index</option>
                <option value="{folder}-{original}">Folder + original</option>
              </select>
            </label>
            <label>
              Prefix
              <input value={settings.prefix} onChange={(event) => updateSettings({ prefix: event.target.value })} />
            </label>
            <label>
              Suffix
              <input value={settings.suffix} onChange={(event) => updateSettings({ suffix: event.target.value })} />
            </label>
          </div>

          <div className="controlGroup">
            <div className="controlTitle">
              <Scissors aria-hidden="true" />
              <span>Resize & crop</span>
            </div>
            <label>
              Max width
              <input
                type="number"
                min="0"
                value={settings.maxWidth}
                onChange={(event) => updateSettings({ maxWidth: Number(event.target.value) })}
              />
            </label>
            <label>
              Max height
              <input
                type="number"
                min="0"
                value={settings.maxHeight}
                onChange={(event) => updateSettings({ maxHeight: Number(event.target.value) })}
              />
            </label>
            <div className="segmented">
              {(["fit", "fill", "crop"] as const).map((mode) => (
                <button
                  key={mode}
                  className={settings.cropMode === mode ? "selected" : ""}
                  type="button"
                  onClick={() => updateSettings({ cropMode: mode })}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="controlGroup">
            <div className="controlTitle">
              <Settings2 aria-hidden="true" />
              <span>Output</span>
            </div>
            <label>
              Format
              <select value={settings.outputFormat} onChange={(event) => updateSettings({ outputFormat: event.target.value as ImageSettings["outputFormat"] })}>
                <option value="original">Original</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </label>
            <label>
              Quality
              <input
                type="range"
                min="0.45"
                max="0.95"
                step="0.01"
                value={settings.quality}
                onChange={(event) => updateSettings({ quality: Number(event.target.value) })}
              />
            </label>
          </div>
        </aside>
      </section>

      <section className="actions" aria-label="Batch actions">
        <button className="primaryAction" type="button" onClick={processQueue} disabled={jobs.length === 0 || isProcessing}>
          {isProcessing ? <RefreshCw aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>{isProcessing ? "Processing" : "Run batch"}</span>
        </button>
        <button type="button" onClick={downloadZip} disabled={totals.completed === 0} title="Download ZIP">
          <Archive aria-hidden="true" />
          <span>ZIP</span>
        </button>
        <button type="button" onClick={resetJobs} disabled={jobs.length === 0} title="Clear queue">
          <Trash2 aria-hidden="true" />
          <span>Clear</span>
        </button>
        <div className="savings">
          <strong>{formatBytes(Math.max(totals.saved, 0))}</strong>
          <span>saved</span>
        </div>
      </section>

      <section className="fileTable" aria-label="Image queue">
        <div className="tableHeader">
          <span>Name</span>
          <span>Output</span>
          <span>Size</span>
          <span>Status</span>
        </div>
        {jobs.length === 0 ? (
          <div className="emptyRows">
            <span>Queue is empty</span>
          </div>
        ) : (
          jobs.map((job) => (
            <div className="fileRow" key={job.id}>
              <span className="truncate">{job.sourceName}</span>
              <span className="truncate">{job.outputName}</span>
              <span>{job.result ? `${formatBytes(job.sourceSize)} -> ${formatBytes(job.result.size)}` : formatBytes(job.sourceSize)}</span>
              <span className={`status ${job.status}`}>{job.error ?? job.status}</span>
              {job.result ? (
                <button type="button" title="Download image" onClick={() => downloadBlob(job.result!.blob, job.result!.name)}>
                  <Download aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
