import {
  Archive,
  Download,
  ImagePlus,
  Languages,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  Trash2,
  Type
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolPage } from "../data/toolPages";
import { formatBytes, outputNameFor, uniqueNames } from "../lib/filenames";
import { detectLanguage, languages, nextLanguage, translateHeading, translations, type LanguageCode, type Translation } from "../lib/i18n";
import { estimateVisualLoss, normalizedSettings } from "../lib/processingPolicy";
import { runWithConcurrency } from "../lib/queue";
import { downloadBlob, zipCompletedJobs } from "../lib/zip";
import { settingsForPreset, type ImageJob, type ImageSettings, type WorkerRequest, type WorkerResponse } from "../lib/types";

type Props = {
  pageHeading: string;
  preset: ToolPage["preset"];
};

const LANGUAGE_STORAGE_KEY = "littlepng-language";

function readInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const storedLanguage = languages.find((language) => language.code === stored)?.code;

  if (storedLanguage) {
    return storedLanguage;
  }

  return detectLanguage(navigator.languages.length > 0 ? navigator.languages : [navigator.language]);
}

function sizeSummary(job: ImageJob, t: Translation): string {
  if (!job.result) {
    return formatBytes(job.sourceSize);
  }

  if (job.result.outcome === "kept-original") {
    return `${formatBytes(job.sourceSize)} ${t.kept}`;
  }

  return `${formatBytes(job.sourceSize)} -> ${formatBytes(job.result.size)}`;
}

function statusLabel(job: ImageJob, t: Translation): string {
  if (job.error) {
    return job.error;
  }

  if (job.result?.outcome === "kept-original") {
    return t.keptOriginal;
  }

  if (job.result?.targetReached === false) {
    return t.targetNotReached;
  }

  if (job.status === "queued") {
    return t.queued;
  }

  if (job.status === "processing") {
    return t.processing;
  }

  if (job.status === "done") {
    return t.done;
  }

  if (job.status === "failed") {
    return t.failed;
  }

  return t.cancelled;
}

function statusClass(job: ImageJob): string {
  if (job.result?.outcome === "kept-original") {
    return "kept";
  }

  return job.status;
}

export default function ImagePrepApp({ pageHeading, preset }: Props) {
  const [settings, setSettings] = useState<ImageSettings>(() => normalizedSettings(settingsForPreset(preset)));
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(() => readInitialLanguage());
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const concurrency = 2;
  const t = translations[language];
  const languageLabel = languages.find((option) => option.code === language)?.shortLabel ?? "EN";
  const isLossless = settings.compressionMode === "lossless";
  const outputOptions =
    settings.compressionMode === "lossless"
      ? [
          { value: "image/png", label: "PNG" }
        ]
      : [
          { value: "original", label: t.original },
          { value: "image/jpeg", label: "JPG" },
          { value: "image/png", label: "PNG" },
          { value: "image/webp", label: "WebP" }
        ];

  const totals = useMemo(() => {
    const source = jobs.reduce((sum, job) => sum + job.sourceSize, 0);
    const output = jobs.reduce((sum, job) => sum + (job.result?.size ?? 0), 0);
    const completed = jobs.filter((job) => job.status === "done").length;
    const saved = output > 0 ? source - output : 0;
    return { source, output, completed, saved };
  }, [jobs]);
  const lossEstimate = useMemo(() => estimateVisualLoss(settings, jobs), [settings, jobs]);
  const lossLabel = {
    None: t.none,
    Low: t.low,
    Medium: t.medium,
    High: t.high
  }[lossEstimate.label];
  const pageTitle = translateHeading(pageHeading, language);

  function updateSettings(next: Partial<ImageSettings>) {
    setSettings((current) => normalizedSettings({ ...current, ...next }));
  }

  function switchLanguage() {
    const next = nextLanguage(language);
    setLanguage(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      document.documentElement.lang = next;
    }
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function addFiles(fileList: FileList | File[]) {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const rawNames = imageFiles.map((file, index) => outputNameFor(file, jobs.length + index, settings));
    const names = uniqueNames(rawNames);
    const newJobs = imageFiles.map((file, index) => ({
      id: crypto.randomUUID(),
      file,
      sourceName: file.name,
      outputName: names[index],
      sourceSize: file.size,
      sourceType: file.type || "image/unknown",
      status: "queued" as const,
      progress: 0
    }));

    setJobs((current) => [...current, ...newJobs]);

    newJobs.forEach((job) => {
      createImageBitmap(job.file)
        .then((bitmap) => {
          const sourceWidth = bitmap.width;
          const sourceHeight = bitmap.height;
          bitmap.close();
          setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, sourceWidth, sourceHeight } : item)));
        })
        .catch(() => undefined);
    });
  }

  useEffect(() => {
    setJobs((current) => {
      const nextNames = uniqueNames(current.map((job, index) => outputNameFor(job.file, index, settings)));

      return current.map((job, index) => {
        if (job.status === "done" || job.status === "processing") {
          return job;
        }

        return { ...job, outputName: nextNames[index] };
      });
    });
  }, [settings]);

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

    await runWithConcurrency(queuedJobs, concurrency, async (job) => {
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
    });

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
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{pageTitle}</h1>
        </div>
        <div className="topbarTools">
          <button className="languageSwitch" type="button" title={t.languageSwitchTitle} onClick={switchLanguage}>
            <Languages aria-hidden="true" />
            <span>{languageLabel}</span>
          </button>
          <div className="metrics" aria-label={t.batchSummaryLabel}>
          <span>{jobs.length} {t.files}</span>
          <span>{formatBytes(totals.source)}</span>
          <span>{totals.completed} {t.done}</span>
          <span>{concurrency} {t.workers}</span>
          </div>
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
          <button className="dropButton" type="button" onClick={() => inputRef.current?.click()} title={t.addImages}>
            <ImagePlus aria-hidden="true" />
            <span>{t.addImages}</span>
          </button>
          <div className="dropStats">
            <span>PNG</span>
            <span>JPG</span>
            <span>WebP</span>
            <span>{t.local}</span>
          </div>
        </div>

        <aside className="controls" aria-label={t.controlsLabel}>
          <div className="controlGroup">
            <div className="controlTitle">
              <Type aria-hidden="true" />
              <span>{t.rename}</span>
            </div>
            <label>
              {t.pattern}
              <select value={settings.renamePattern} onChange={(event) => updateSettings({ renamePattern: event.target.value })}>
                <option value="{original}">{t.original}</option>
                <option value="{original}-{index}">{t.originalIndex}</option>
                <option value="{prefix}-{index}">{t.prefixIndex}</option>
                <option value="{folder}-{original}">{t.folderOriginal}</option>
              </select>
            </label>
            <label>
              {t.prefix}
              <input value={settings.prefix} onChange={(event) => updateSettings({ prefix: event.target.value })} />
            </label>
            <label>
              {t.suffix}
              <input value={settings.suffix} onChange={(event) => updateSettings({ suffix: event.target.value })} />
            </label>
          </div>

          <div className="controlGroup">
            <div className="controlTitle">
              <Scissors aria-hidden="true" />
              <span>{t.resizeCrop}</span>
            </div>
            <label>
              {t.maxWidth}
              <input
                type="number"
                min="0"
                value={settings.maxWidth}
                disabled={isLossless}
                onChange={(event) => updateSettings({ maxWidth: Number(event.target.value) })}
              />
            </label>
            <label>
              {t.maxHeight}
              <input
                type="number"
                min="0"
                value={settings.maxHeight}
                disabled={isLossless}
                onChange={(event) => updateSettings({ maxHeight: Number(event.target.value) })}
              />
            </label>
            <div className="segmented">
              {(["fit", "fill", "crop"] as const).map((mode) => (
                <button
                  key={mode}
                  className={settings.cropMode === mode ? "selected" : ""}
                  type="button"
                  disabled={isLossless}
                  onClick={() => updateSettings({ cropMode: mode })}
                >
                  {mode === "fit" ? t.fit : mode === "fill" ? t.fill : t.crop}
                </button>
              ))}
            </div>
          </div>

          <div className="controlGroup">
            <div className="controlTitle">
              <Settings2 aria-hidden="true" />
              <span>{t.output}</span>
            </div>
            <label>
              {t.mode}
              <div className="segmented two">
                {(["lossless", "lossy"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={settings.compressionMode === mode ? "selected" : ""}
                    type="button"
                    onClick={() => updateSettings({ compressionMode: mode })}
                  >
                    {mode === "lossless" ? t.lossless : t.lossy}
                  </button>
                ))}
              </div>
            </label>
            <label>
              {t.format}
              <select value={settings.outputFormat} onChange={(event) => updateSettings({ outputFormat: event.target.value as ImageSettings["outputFormat"] })}>
                {outputOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.quality}
              <input
                type="range"
                min="0.45"
                max="0.95"
                step="0.01"
                value={settings.quality}
                disabled={isLossless}
                onChange={(event) => updateSettings({ quality: Number(event.target.value) })}
              />
            </label>
            <label>
              {t.targetSize}
              <input
                type="number"
                min="0"
                step="10"
                value={settings.targetSizeKb}
                disabled={isLossless}
                onChange={(event) => updateSettings({ targetSizeKb: Math.max(0, Number(event.target.value)) })}
              />
            </label>
            <div className={`lossMeter ${lossEstimate.label.toLowerCase()}`}>
              <span>{t.estimatedLoss}</span>
              <strong>{lossEstimate.percent}%</strong>
              <em>{lossLabel}</em>
            </div>
          </div>
        </aside>
      </section>

      <section className="actions" aria-label={t.actionsLabel}>
        <button className="primaryAction" type="button" onClick={processQueue} disabled={jobs.length === 0 || isProcessing}>
          {isProcessing ? <RefreshCw aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>{isProcessing ? t.processing : t.runBatch}</span>
        </button>
        <button type="button" onClick={downloadZip} disabled={totals.completed === 0} title={t.downloadZip}>
          <Archive aria-hidden="true" />
          <span>ZIP</span>
        </button>
        <button type="button" onClick={resetJobs} disabled={jobs.length === 0} title={t.clearQueue}>
          <Trash2 aria-hidden="true" />
          <span>{t.clearQueue}</span>
        </button>
        <div className="savings">
          <strong>{formatBytes(Math.max(totals.saved, 0))}</strong>
          <span>{t.saved}</span>
        </div>
      </section>

      <section className="fileTable" aria-label={t.queueLabel}>
        <div className="tableHeader">
          <span>{t.name}</span>
          <span>{t.output}</span>
          <span>{t.size}</span>
          <span>{t.status}</span>
        </div>
        {jobs.length === 0 ? (
          <div className="emptyRows">
            <span>{t.queueEmpty}</span>
          </div>
        ) : (
          jobs.map((job) => (
            <div className="fileRow" key={job.id}>
              <span className="truncate">{job.sourceName}</span>
              <span className="truncate">{job.outputName}</span>
              <span>{sizeSummary(job, t)}</span>
              <span className={`status ${statusClass(job)}`}>{statusLabel(job, t)}</span>
              {job.result ? (
                <button type="button" title={t.downloadImage} onClick={() => downloadBlob(job.result!.blob, job.result!.name)}>
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
