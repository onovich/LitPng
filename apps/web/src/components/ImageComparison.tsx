import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../lib/filenames";
import type { ImageJob } from "../lib/types";

type Props = {
  job: ImageJob;
  labels: {
    title: string;
    before: string;
    after: string;
    close: string;
    loading: string;
  };
  onClose: () => void;
  error?: string;
};

export default function ImageComparison({ job, labels, onClose, error }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [urls, setUrls] = useState<{ source: string; output: string }>();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!job.result?.sourcePreview || !job.result.outputPreview) {
      return;
    }

    const source = URL.createObjectURL(job.result.sourcePreview);
    const output = URL.createObjectURL(job.result.outputPreview);
    setUrls({ source, output });

    return () => {
      URL.revokeObjectURL(source);
      URL.revokeObjectURL(output);
    };
  }, [job]);

  return (
    <dialog
      className="comparisonDialog"
      ref={dialogRef}
      aria-labelledby="comparison-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <header className="comparisonHeader">
        <div>
          <p>{job.sourceName}</p>
          <h2 id="comparison-title">{labels.title}</h2>
        </div>
        <button type="button" autoFocus aria-label={labels.close} onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </header>
      {urls && job.result ? (
        <div className="comparisonGrid">
          <figure>
            <div className="comparisonImage"><img src={urls.source} alt={`${labels.before}: ${job.sourceName}`} /></div>
            <figcaption><strong>{labels.before}</strong><span>{formatBytes(job.sourceSize)}</span></figcaption>
          </figure>
          <figure>
            <div className="comparisonImage"><img src={urls.output} alt={`${labels.after}: ${job.result.name}`} /></div>
            <figcaption><strong>{labels.after}</strong><span>{formatBytes(job.result.size)}</span></figcaption>
          </figure>
        </div>
      ) : error ? (
        <p className="comparisonError" role="alert">{error}</p>
      ) : (
        <p className="comparisonLoading" role="status">{labels.loading}</p>
      )}
    </dialog>
  );
}
