import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { anchorPoint, cropFrameOrigin } from "../lib/geometry";
import type { CropAnchor, CropFrame, ImageJob, ImageSettings } from "../lib/types";
import type { Translation } from "../lib/i18n";

const anchors: CropAnchor[] = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"];
const handles = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
type Props = { job: ImageJob; settings: ImageSettings; t: Translation; disabled: boolean; onChange: (next: Partial<ImageSettings>) => void };

export default function VisualCropEditor({ job, settings, t, disabled, onChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; frame: CropFrame; origin: { x: number; y: number }; edge?: number[] } | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = { width: job.sourceWidth ?? 1, height: job.sourceHeight ?? 1 };
  const frame = settings.cropFrame ?? { width: Math.max(1, Math.round(source.width * 0.8)), height: Math.max(1, Math.round(source.height * 0.8)), offsetX: 0, offsetY: 0 };
  const origin = cropFrameOrigin(source, frame, settings.cropAnchor);
  const point = anchorPoint(settings.cropAnchor);
  const names = t.cropAnchorNames.split("|");

  useEffect(() => {
    let cancelled = false;
    setReady(false); setFailed(false);
    if (!job.sourceWidth || !job.sourceHeight) return;
    const scale = Math.min(1, 1200 / job.sourceWidth, 800 / job.sourceHeight);
    createImageBitmap(job.file, { resizeWidth: Math.max(1, Math.round(job.sourceWidth * scale)), resizeHeight: Math.max(1, Math.round(job.sourceHeight * scale)) })
      .then((bitmap) => {
        if (!cancelled && canvas.current) {
          canvas.current.width = bitmap.width; canvas.current.height = bitmap.height;
          const context = canvas.current.getContext("2d");
          if (context) { context.drawImage(bitmap, 0, 0); setReady(true); } else setFailed(true);
        }
        bitmap.close();
      }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [job.file, job.sourceWidth, job.sourceHeight]);

  function commit(next: CropFrame) {
    const safe = { ...next, width: Math.min(8192, Math.max(1, Math.round(next.width))), height: Math.min(8192, Math.max(1, Math.round(next.height))), offsetX: Math.max(-32768, Math.min(32768, Math.round(next.offsetX))), offsetY: Math.max(-32768, Math.min(32768, Math.round(next.offsetY))) };
    onChange({ cropFrame: safe, maxWidth: safe.width, maxHeight: safe.height, cropMode: "crop", outputWidths: [] });
  }
  function place(width: number, height: number, x: number, y: number) {
    const next = { ...frame, width, height, offsetX: x - (source.width - width) * point.x, offsetY: y - (source.height - height) * point.y };
    const clamped = cropFrameOrigin(source, next, settings.cropAnchor);
    commit({ ...next, offsetX: clamped.x - (source.width - width) * point.x, offsetY: clamped.y - (source.height - height) * point.y });
  }
  function start(event: PointerEvent<HTMLElement>, edge?: number[]) {
    if (disabled || !ready) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, frame: { ...frame }, origin, edge };
  }
  function move(event: PointerEvent<HTMLElement>) {
    const initial = drag.current, rect = stage.current?.getBoundingClientRect();
    if (!initial || !rect || disabled) return;
    const dx = (event.clientX - initial.x) * source.width / rect.width;
    const dy = (event.clientY - initial.y) * source.height / rect.height;
    if (!initial.edge) { place(initial.frame.width, initial.frame.height, initial.origin.x + dx, initial.origin.y + dy); return; }
    const [ex, ey] = initial.edge;
    const width = Math.round(Math.max(1, Math.min(source.width, initial.frame.width + dx * ex)));
    const height = Math.round(Math.max(1, Math.min(source.height, initial.frame.height + dy * ey)));
    place(width, height, ex < 0 ? initial.origin.x + initial.frame.width - width : initial.origin.x, ey < 0 ? initial.origin.y + initial.frame.height - height : initial.origin.y);
  }
  function keyboard(event: KeyboardEvent<HTMLElement>, edge?: number[]) {
    const amount = event.shiftKey ? 10 : 1;
    const dx = event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0;
    const dy = event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0;
    if ((!dx && !dy) || disabled) return;
    event.preventDefault(); event.stopPropagation();
    if (!edge) place(frame.width, frame.height, origin.x + dx, origin.y + dy);
    else {
      const width = Math.max(1, Math.min(source.width, frame.width + dx * edge[0]));
      const height = Math.max(1, Math.min(source.height, frame.height + dy * edge[1]));
      place(width, height, edge[0] < 0 ? origin.x + frame.width - width : origin.x, edge[1] < 0 ? origin.y + frame.height - height : origin.y);
    }
  }
  return <section className="visualCrop" aria-label={t.cropReference}>
    <p className="cropReference"><strong>{t.cropReference}</strong><span>{job.sourceName} · {source.width} × {source.height}px</span></p>
    <p className="controlHint">{t.cropGuide}</p>
    {failed && <p role="alert">{t.cropPreviewError}</p>}
    <div className="cropWorkbench">
      <div className="cropStage" ref={stage} style={{ aspectRatio: `${source.width} / ${source.height}`, maxWidth: `${Math.min(720, 420 * source.width / source.height)}px` }}>
        <canvas ref={canvas} className="cropImage" aria-label={t.cropReference} />
        {ready && <>
          <span className="cropAnchorMarker" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} aria-hidden="true" />
          <div className="cropFrame" role="group" tabIndex={disabled ? -1 : 0} aria-label={t.cropFrameLabel}
            style={{ left: `${origin.x / source.width * 100}%`, top: `${origin.y / source.height * 100}%`, width: `${frame.width / source.width * 100}%`, height: `${frame.height / source.height * 100}%` }}
            onPointerDown={(e) => start(e)} onPointerMove={move} onPointerUp={() => { drag.current = undefined; }} onPointerCancel={() => { drag.current = undefined; }} onKeyDown={(e) => keyboard(e)}>
            <span className="cropGrid" aria-hidden="true" />
            {handles.map((edge) => <button key={edge.join()} className="cropHandle" type="button" disabled={disabled}
              aria-label={`${t.cropResizeHandle}: ${names[(edge[1] + 1) * 3 + edge[0] + 1]}`}
              style={{ left: `${(edge[0] + 1) * 50}%`, top: `${(edge[1] + 1) * 50}%`, cursor: edge[0] === 0 ? "ns-resize" : edge[1] === 0 ? "ew-resize" : edge[0] === edge[1] ? "nwse-resize" : "nesw-resize" }}
              onPointerDown={(e) => start(e, edge)} onPointerMove={move} onPointerUp={() => { drag.current = undefined; }} onPointerCancel={() => { drag.current = undefined; }} onKeyDown={(e) => keyboard(e, edge)} />)}
          </div>
        </>}
      </div>
      <div className="cropSettings">
        <fieldset className="anchorSelector" disabled={disabled}><legend>{t.cropAnchorLabel}</legend><div>
          {anchors.map((anchor, i) => <button key={anchor} type="button" aria-label={`${t.cropAnchorLabel}: ${names[i]}`} aria-pressed={settings.cropAnchor === anchor}
            onClick={() => onChange({ cropAnchor: anchor, cropFrame: { ...frame, offsetX: 0, offsetY: 0 }, cropMode: "crop", maxWidth: frame.width, maxHeight: frame.height, outputWidths: [] })}><span aria-hidden="true">{["↖", "↑", "↗", "←", "•", "→", "↙", "↓", "↘"][i]}</span></button>)}
        </div></fieldset>
        <output className="cropSize" aria-live="polite">{frame.width} × {frame.height}px</output>
        <label>{t.cropScale}<input type="range" min="0.05" max="1" step="0.01" disabled={disabled} value={Math.min(1, frame.width / source.width)} onChange={(e) => { const scale = Number(e.target.value); commit({ ...frame, width: Math.round(source.width * scale), height: Math.round(source.height * scale) }); }} /></label>
        <button type="button" disabled={disabled} onClick={() => commit({ width: Math.round(source.width * 0.8), height: Math.round(source.height * 0.8), offsetX: 0, offsetY: 0 })}>{t.cropReset}</button>
      </div>
    </div>
    <p className="controlHint">{t.cropPadding}</p>
    <details className="cropPrecision"><summary>{t.cropPrecision}</summary><div>
      <label>{t.maxWidth}<input type="number" min="1" max="8192" disabled={disabled} value={frame.width} onChange={(e) => commit({ ...frame, width: Number(e.target.value) })} /></label>
      <label>{t.maxHeight}<input type="number" min="1" max="8192" disabled={disabled} value={frame.height} onChange={(e) => commit({ ...frame, height: Number(e.target.value) })} /></label>
      <label>{t.cropOffsetX}<input type="number" min="-32768" max="32768" disabled={disabled} value={frame.offsetX} onChange={(e) => commit({ ...frame, offsetX: Math.max(-32768, Math.min(32768, Number(e.target.value))) })} /></label>
      <label>{t.cropOffsetY}<input type="number" min="-32768" max="32768" disabled={disabled} value={frame.offsetY} onChange={(e) => commit({ ...frame, offsetY: Math.max(-32768, Math.min(32768, Number(e.target.value))) })} /></label>
    </div></details>
  </section>;
}
