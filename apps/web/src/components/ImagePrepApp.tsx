import {
  Archive,
  Download,
  Eye,
  FileDown,
  FolderOpen,
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
import ImageComparison from "./ImageComparison";
import SavedPresetManager from "./SavedPresetManager";
import BatchHistory from "./BatchHistory";
import QueueControls from "./QueueControls";
import { useBatchHistory } from "../hooks/useBatchHistory";
import { createBatchHistoryEntry } from "../lib/batchHistory";
import type { ToolPage } from "../data/toolPages";
import { archivePathFor, formatBytes, outputNameFor, uniqueNamesByDirectory } from "../lib/filenames";
import { detectLanguage, languages, nextLanguage, translateHeading, translations, type LanguageCode, type Translation } from "../lib/i18n";
import { estimateVisualLoss, normalizedSettings } from "../lib/processingPolicy";
import { publishingPresets, settingsForPublishingPreset, type PublishingPresetId } from "../lib/publishingPresets";
import type { SavedPreset } from "../lib/savedPresets";
import { createQueueController, runWithConcurrency, type QueueController } from "../lib/queue";
import { requestProcessing } from "../lib/workerClient";
import { compressionReportBlob } from "../lib/report";
import { downloadBlob, zipCompletedJobs } from "../lib/zip";
import { settingsForPreset, type ImageJob, type ImageSettings, type WorkerRequest, type WorkerResponse } from "../lib/types";

type Props = {
  pageHeading: string;
  preset: ToolPage["preset"];
};

const LANGUAGE_STORAGE_KEY = "littlepng-language";
const QUEUE_PAGE_SIZE = 50;

function readInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // A blocked storage policy must not prevent local image processing.
  }
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
  const [isPaused, setIsPaused] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 });
  const [queuePage, setQueuePage] = useState(0);
  const [language, setLanguage] = useState<LanguageCode>(() => readInitialLanguage());
  const [comparisonJobId, setComparisonJobId] = useState<string>();
  const [comparisonError, setComparisonError] = useState<string>();
  const [publishingPreset, setPublishingPreset] = useState<PublishingPresetId>("custom");
  const [savedPresetId, setSavedPresetId] = useState<string>();
  const history = useBatchHistory();
  const workerRef = useRef<Worker | null>(null);
  const queueControllerRef = useRef<QueueController | null>(null);
  const workerAbortRef = useRef<AbortController | null>(null);
  const metadataChainRef = useRef(Promise.resolve());
  const metadataGenerationRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const directoryRef = useRef<HTMLInputElement | null>(null);
  // One actual Worker: never overlap two large decodes/encodes inside it.
  const concurrency = 1;
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
    const completedSource = jobs.reduce((sum, job) => sum + (job.result ? job.sourceSize : 0), 0);
    const saved = completedSource - output;
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
  const comparisonJob = jobs.find((job) => job.id === comparisonJobId);
  const pageCount = Math.max(1, Math.ceil(jobs.length / QUEUE_PAGE_SIZE));
  const visiblePage = Math.min(queuePage, pageCount - 1);
  const visibleJobs = jobs.slice(visiblePage * QUEUE_PAGE_SIZE, (visiblePage + 1) * QUEUE_PAGE_SIZE);

  function updateSettings(next: Partial<ImageSettings>) {
    setPublishingPreset("custom");
    setSavedPresetId(undefined);
    setSettings((current) => normalizedSettings({ ...current, ...next }));
  }

  function applyPublishingPreset(nextPreset: PublishingPresetId) {
    setPublishingPreset(nextPreset);
    setSavedPresetId(undefined);

    if (nextPreset !== "custom") {
      setSettings(normalizedSettings(settingsForPublishingPreset(nextPreset)));
    }
  }

  function applySavedPreset(savedPreset: SavedPreset) {
    setPublishingPreset("custom");
    setSavedPresetId(savedPreset.id);
    setSettings(normalizedSettings(savedPreset.settings));
  }

  function switchLanguage() {
    const next = nextLanguage(language);
    setLanguage(next);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // The language change still works for this session.
      }
      document.documentElement.lang = next;
    }
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => () => {
    metadataGenerationRef.current += 1;
    queueControllerRef.current?.cancel();
    workerAbortRef.current?.abort();
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  function addFiles(fileList: FileList | File[]) {
    if (queueControllerRef.current) return;
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const relativePaths = imageFiles.map((file) => file.webkitRelativePath || file.name);
    const rawNames = imageFiles.map((file, index) =>
      outputNameFor(file, jobs.length + index, settings, { relativePath: file.webkitRelativePath })
    );
    const names = uniqueNamesByDirectory(
      [...jobs.map((job) => job.outputName), ...rawNames],
      [...jobs.map((job) => job.sourceRelativePath), ...relativePaths],
      settings.preserveFolders
    ).slice(jobs.length);
    const newJobs = imageFiles.map((file, index) => ({
      id: crypto.randomUUID(),
      file,
      sourceName: file.name,
      sourceRelativePath: file.webkitRelativePath || file.name,
      outputName: names[index],
      sourceSize: file.size,
      sourceType: file.type || "image/unknown",
      status: "queued" as const,
      progress: 0
    }));

    setJobs((current) => [...current, ...newJobs]);

    const generation = metadataGenerationRef.current;
    metadataChainRef.current = metadataChainRef.current.then(async () => {
      for (const job of newJobs) {
        if (metadataGenerationRef.current !== generation) return;
        try {
          const bitmap = await createImageBitmap(job.file);
          const sourceWidth = bitmap.width;
          const sourceHeight = bitmap.height;
          bitmap.close();
          if (metadataGenerationRef.current === generation) {
            setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, sourceWidth, sourceHeight } : item)));
          }
        } catch {
          // The processing worker reports per-file decode failures later.
        }
      }
    });
  }

  useEffect(() => {
    setJobs((current) => {
      const nextNames = uniqueNamesByDirectory(current.map((job, index) =>
        outputNameFor(job.file, index, settings, { relativePath: job.sourceRelativePath })
      ), current.map((job) => job.sourceRelativePath), settings.preserveFolders);

      return current.map((job, index) => {
        if (job.status === "done" || job.status === "processing") {
          return job;
        }

        return { ...job, outputName: nextNames[index] };
      });
    });
  }, [settings]);

  function resetJobs() {
    if (queueControllerRef.current) return;
    metadataGenerationRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setComparisonJobId(undefined);
    setComparisonError(undefined);
    setJobs([]);
    setQueuePage(0);
    setBatchProgress({ completed: 0, total: 0 });
  }

  function getWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("../workers/imageWorker.ts", import.meta.url), { type: "module" });
    }

    return workerRef.current;
  }

  async function openComparison(job: ImageJob) {
    if (!job.result) {
      return;
    }

    setComparisonJobId(job.id);
    setComparisonError(undefined);
    if (job.result.sourcePreview && job.result.outputPreview) {
      return;
    }

    const worker = getWorker();
    const response = await new Promise<WorkerResponse>((resolve) => {
      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (
          event.data.jobId !== job.id ||
          (event.data.type !== "preview" && event.data.type !== "preview-failed")
        ) {
          return;
        }

        worker.removeEventListener("message", onMessage);
        resolve(event.data);
      };

      worker.addEventListener("message", onMessage);
      worker.postMessage({
        type: "preview",
        jobId: job.id,
        file: job.file,
        outputBlob: job.result!.blob
      } satisfies WorkerRequest);
    });

    if (response.type === "preview") {
      setJobs((current) => current.map((item) =>
        item.id === job.id && item.result
          ? { ...item, result: { ...item.result, sourcePreview: response.sourcePreview, outputPreview: response.outputPreview } }
          : item
      ));
    } else if (response.type === "preview-failed") {
      setComparisonError(response.error);
    }
  }

  async function processQueue() {
    if (queueControllerRef.current) {
      return;
    }

    const queuedJobs = jobs.filter((job) => job.status === "queued" || job.status === "failed" || job.status === "cancelled");
    if (queuedJobs.length === 0) return;
    const historyToken = history.beginBatch();
    const batchSettings = { ...settings };
    const startedAt = performance.now();
    const finishedJobs: ImageJob[] = [];
    const controller = createQueueController();
    queueControllerRef.current = controller;
    workerAbortRef.current = new AbortController();
    setIsPaused(false);
    setIsStopping(false);
    setBatchProgress({ completed: 0, total: queuedJobs.length });
    setIsProcessing(true);

    try {
      await runWithConcurrency(queuedJobs, concurrency, async (job) => {
        setJobs((current) =>
          current.map((item) => (item.id === job.id ? { ...item, status: "processing", progress: 35, error: undefined } : item))
        );

        let response: Extract<WorkerResponse, { type: "done" | "failed" }>;
        try {
          const worker = getWorker();
          response = await requestProcessing(worker, {
            type: "process",
            jobId: job.id,
            file: job.file,
            outputName: job.outputName,
            archivePath: archivePathFor(job.sourceRelativePath, job.outputName, batchSettings.preserveFolders),
            settings: batchSettings
          }, () => { workerRef.current = null; }, 120_000, workerAbortRef.current?.signal);
        } catch {
          response = { type: "failed", jobId: job.id, error: "Could not start the image worker. Retry this image." };
        }

        if (response.type === "done") {
          finishedJobs.push({ ...job, status: "done", result: response.result });
        } else if (response.type === "failed") {
          finishedJobs.push({ ...job, status: "failed", result: undefined, error: response.error });
        }
        setBatchProgress({ completed: finishedJobs.length, total: queuedJobs.length });

        setJobs((current) =>
          current.map((item) => {
            if (item.id !== job.id) {
              return item;
            }

            if (response.type === "done") {
              return { ...item, status: "done", progress: 100, result: response.result };
            }

            if (response.type === "failed") {
              return { ...item, status: "failed", progress: 0, error: response.error };
            }

            return item;
          })
        );
      }, controller);

      if (controller.cancelled) {
        const finishedIds = new Set(finishedJobs.map((job) => job.id));
        const stoppedIds = new Set(queuedJobs.filter((job) => !finishedIds.has(job.id)).map((job) => job.id));
        setJobs((current) => current.map((job) => stoppedIds.has(job.id)
          ? { ...job, status: "cancelled", progress: 0, error: undefined }
          : job));
      }

      if (!workerAbortRef.current?.signal.aborted) {
        history.recordBatch(historyToken, createBatchHistoryEntry(
          crypto.randomUUID(), new Date().toISOString(), batchSettings, finishedJobs, performance.now() - startedAt
        ));
      }
    } finally {
      queueControllerRef.current = null;
      workerAbortRef.current = null;
      setIsPaused(false);
      setIsStopping(false);
      setIsProcessing(false);
    }
  }

  async function downloadZip() {
    const blob = await zipCompletedJobs(jobs);
    downloadBlob(blob, "littlepng-export.zip");
  }

  function downloadReport() {
    downloadBlob(compressionReportBlob(jobs), "littlepng-report.csv");
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
            disabled={isProcessing}
            aria-label={t.addImages}
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => event.currentTarget.files && addFiles(event.currentTarget.files)}
          />
          <input
            ref={directoryRef}
            type="file"
            disabled={isProcessing}
            aria-label={t.addFolder}
            accept="image/png,image/jpeg,image/webp"
            multiple
            {...{ webkitdirectory: "", directory: "" }}
            onChange={(event) => event.currentTarget.files && addFiles(event.currentTarget.files)}
          />
          <div className="dropActions">
            <button className="dropButton" type="button" disabled={isProcessing} onClick={() => inputRef.current?.click()} title={t.addImages}>
              <ImagePlus aria-hidden="true" />
              <span>{t.addImages}</span>
            </button>
            <button type="button" disabled={isProcessing} onClick={() => directoryRef.current?.click()} title={t.addFolder}>
              <FolderOpen aria-hidden="true" />
              <span>{t.addFolder}</span>
            </button>
          </div>
          <div className="dropStats">
            <span>PNG</span>
            <span>JPG</span>
            <span>WebP</span>
            <span>{t.local}</span>
          </div>
        </div>

        <fieldset className="controls" disabled={isProcessing} aria-label={t.controlsLabel}>
          <div className="controlGroup">
            <div className="controlTitle">
              <Type aria-hidden="true" />
              <span>{t.rename}</span>
            </div>
            <label>
              {t.pattern}
              <input
                list="rename-pattern-options"
                value={settings.renamePattern}
                aria-describedby="rename-pattern-help"
                onChange={(event) => updateSettings({ renamePattern: event.target.value })}
              />
              <datalist id="rename-pattern-options">
                <option value="{original}" />
                <option value="{original}-{index}" />
                <option value="{prefix}-{index}" />
                <option value="{folder}-{original}" />
                <option value="{date}-{original}" />
              </datalist>
            </label>
            <small className="controlHint" id="rename-pattern-help">{t.patternHelp}</small>
            <label className="checkLabel">
              <input
                type="checkbox"
                checked={settings.preserveFolders}
                onChange={(event) => updateSettings({ preserveFolders: event.target.checked })}
              />
              <span>{t.preserveFolders}</span>
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
              {t.publishingPreset}
              <select
                value={publishingPreset}
                onChange={(event) => applyPublishingPreset(event.target.value as PublishingPresetId)}
              >
                <option value="custom">{t.customPreset}</option>
                {publishingPresets.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id === "shopify"
                      ? t.shopifyPreset
                      : option.id === "wordpress"
                        ? t.wordpressPreset
                        : t.openGraphPreset}
                  </option>
                ))}
              </select>
            </label>
            {publishingPreset !== "custom" && (
              <small className="controlHint">
                {publishingPreset === "shopify"
                  ? t.shopifyPresetHint
                  : publishingPreset === "wordpress"
                    ? t.wordpressPresetHint
                    : t.openGraphPresetHint}
              </small>
            )}
            <SavedPresetManager
              settings={settings}
              activePresetId={savedPresetId}
              t={t}
              onApply={applySavedPreset}
              onActiveChange={setSavedPresetId}
            />
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
        </fieldset>
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
        <button
          type="button"
          onClick={downloadReport}
          disabled={!jobs.some((job) => job.status === "done" || job.status === "failed")}
          title={t.downloadReport}
        >
          <FileDown aria-hidden="true" />
          <span>CSV</span>
        </button>
        <button type="button" onClick={resetJobs} disabled={jobs.length === 0 || isProcessing} title={t.clearQueue}>
          <Trash2 aria-hidden="true" />
          <span>{t.clearQueue}</span>
        </button>
        <button type="button" disabled={totals.completed === 0 || isProcessing} onClick={() => {
          metadataGenerationRef.current += 1;
          workerRef.current?.terminate();
          workerRef.current = null;
          setComparisonJobId(undefined);
          setJobs((current) => current.filter((job) => job.status !== "done"));
          setBatchProgress({ completed: 0, total: 0 });
          setQueuePage(0);
        }}>{t.queueRemoveCompleted}</button>
        <div className="savings">
          <strong>{formatBytes(Math.max(totals.saved, 0))}</strong>
          <span>{t.saved}</span>
        </div>
      </section>

      <QueueControls
        t={t} active={isProcessing} paused={isPaused} stopping={isStopping}
        completed={batchProgress.completed} total={batchProgress.total}
        onPause={() => { queueControllerRef.current?.pause(); setIsPaused(true); }}
        onResume={() => { queueControllerRef.current?.resume(); setIsPaused(false); }}
        onStop={() => { queueControllerRef.current?.cancel(); setIsStopping(true); }}
      />
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
          visibleJobs.map((job) => (
            <div className="fileRow" key={job.id}>
              <span className="truncate">{job.sourceName}</span>
              <span className="truncate">{job.outputName}</span>
              <span>{sizeSummary(job, t)}</span>
              <span className={`status ${statusClass(job)}`}>{statusLabel(job, t)}</span>
              {job.result ? (
                <div className="fileActions">
                  <button type="button" disabled={isProcessing} title={t.compareImages} onClick={() => void openComparison(job)}>
                    <Eye aria-hidden="true" />
                  </button>
                  <button type="button" title={t.downloadImage} onClick={() => downloadBlob(job.result!.blob, job.result!.name)}>
                    <Download aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </section>
      {pageCount > 1 && (
        <nav className="queuePagination" aria-label={t.queuePages}>
          <button type="button" disabled={visiblePage === 0} onClick={() => setQueuePage(visiblePage - 1)}>{t.queuePrevious}</button>
          <span>{visiblePage + 1} / {pageCount}</span>
          <button type="button" disabled={visiblePage + 1 === pageCount} onClick={() => setQueuePage(visiblePage + 1)}>{t.queueNext}</button>
        </nav>
      )}
      <BatchHistory
        entries={history.entries}
        enabled={history.enabled}
        storageError={history.storageError}
        isProcessing={isProcessing}
        t={t}
        language={language}
        onEnabledChange={history.setEnabled}
        onApply={(entry) => {
          setPublishingPreset("custom");
          setSavedPresetId(undefined);
          setSettings(normalizedSettings({ ...entry.settings }));
        }}
        onRemove={history.removeEntry}
        onClear={history.clear}
      />
      {comparisonJob?.result ? (
        <ImageComparison
          job={comparisonJob}
          error={comparisonError}
          onClose={() => {
            setComparisonJobId(undefined);
            setComparisonError(undefined);
          }}
          labels={{
            title: t.comparisonTitle,
            before: t.before,
            after: t.after,
            close: t.closeComparison,
            loading: t.loadingPreview
          }}
        />
      ) : null}
    </main>
  );
}
