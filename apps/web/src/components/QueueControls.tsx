import type { Translation } from "../lib/i18n";

type Props = {
  t: Translation;
  active: boolean;
  paused: boolean;
  stopping: boolean;
  completed: number;
  total: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

export default function QueueControls(props: Props) {
  const { t } = props;
  if (!props.total) return null;

  return (
    <section className="queueControls" aria-label={t.queueProgress}>
      <div className="queueProgressText" role="status">
        <span>{t.queueProgress}: {props.completed} / {props.total}</span>
        {props.active && <span>{props.stopping ? t.queueStopping : props.paused ? t.queuePaused : t.processing}</span>}
      </div>
      <progress aria-label={t.queueProgress} max={props.total} value={props.completed} />
      {props.active && (
        <div className="queueControlActions">
          <button type="button" disabled={props.stopping} onClick={props.paused ? props.onResume : props.onPause}>
            {props.paused ? t.queueResume : t.queuePause}
          </button>
          <button type="button" disabled={props.stopping} onClick={props.onStop}>{t.queueStop}</button>
        </div>
      )}
      <small className="controlHint">{t.queueControlHint}</small>
    </section>
  );
}
