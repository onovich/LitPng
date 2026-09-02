import { useRef, useState } from "react";
import type { BatchHistoryEntry } from "../lib/batchHistory";
import { formatBytes } from "../lib/filenames";
import type { LanguageCode, Translation } from "../lib/i18n";

type Props = {
  entries: BatchHistoryEntry[];
  enabled: boolean;
  storageError: boolean;
  isProcessing: boolean;
  t: Translation;
  language: LanguageCode;
  onEnabledChange: (enabled: boolean) => void;
  onApply: (entry: BatchHistoryEntry) => void;
  onRemove: (id: string) => boolean;
  onClear: () => boolean;
};

export default function BatchHistory(props: Props) {
  const { t } = props;
  const [message, setMessage] = useState<"applied" | "deleted" | "cleared">();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formatter = new Intl.DateTimeFormat(props.language, { dateStyle: "medium", timeStyle: "short" });
  const status = message === "applied" ? t.historyApplied : message === "deleted" ? t.historyDeleted : message === "cleared" ? t.historyCleared : "";

  return (
    <section className="batchHistory" aria-labelledby="batch-history-heading">
      <div className="historyHeading">
        <h2 id="batch-history-heading" tabIndex={-1} ref={headingRef}>{t.historyTitle}</h2>
        <button type="button" disabled={props.entries.length === 0} onClick={() => {
          if (props.onClear()) {
            setMessage("cleared");
            headingRef.current?.focus();
          }
        }}>{t.historyClear}</button>
      </div>
      <p className="controlHint">{t.historyPrivacy}</p>
      <label className="checkLabel">
        <input type="checkbox" checked={props.enabled} onChange={(event) => props.onEnabledChange(event.target.checked)} />
        <span>{t.historyRemember}</span>
      </label>
      {props.storageError && <p role="alert" className="historyError">{t.historyStorageError}</p>}
      <p role="status" aria-label={t.historyTitle} className="controlHint">{status}</p>
      {props.entries.length === 0 ? <p className="controlHint">{t.historyEmpty}</p> : (
        <ul className="historyList">
          {props.entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <time dateTime={entry.finishedAt}>{formatter.format(new Date(entry.finishedAt))}</time>
                <p>{entry.completed} {t.done} · {entry.failed} {t.failed}</p>
                <p>{formatBytes(entry.inputBytes)} → {formatBytes(entry.outputBytes)} · {(entry.durationMs / 1000).toFixed(1)} s</p>
              </div>
              <div className="historyActions">
                <button type="button" disabled={props.isProcessing} onClick={() => {
                  props.onApply(entry);
                  setMessage("applied");
                }}>{t.historyReuse}</button>
                <button type="button" onClick={() => {
                  if (props.onRemove(entry.id)) {
                    setMessage("deleted");
                    headingRef.current?.focus();
                  }
                }}>{t.historyDelete}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
