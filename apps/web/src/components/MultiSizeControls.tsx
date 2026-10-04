import { useRef, useState } from "react";
import type { Translation } from "../lib/i18n";
import { MAX_OUTPUT_WIDTH, MAX_OUTPUT_WIDTHS } from "../lib/multiSize";

type Props = {
  widths: number[];
  disabled: boolean;
  t: Translation;
  onChange: (widths: number[]) => void;
};

export default function MultiSizeControls({ widths, disabled, t, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  function add() {
    const width = Number(draft);
    if (!Number.isInteger(width) || width < 1 || width > MAX_OUTPUT_WIDTH || widths.length >= MAX_OUTPUT_WIDTHS || widths.includes(width)) {
      setError(true);
      return;
    }
    onChange([...widths, width].sort((a, b) => a - b));
    setDraft("");
    setError(false);
  }

  return (
    <fieldset className="multiSizeControls" disabled={disabled}>
      <legend>{t.multiSizeTitle}</legend>
      <small className="controlHint" id="multi-size-help">{t.multiSizeHelp}</small>
      <div className="multiSizeEditor">
        <label>
          {t.multiSizeWidth}
          <input
            ref={inputRef}
            type="number" min="1" max={MAX_OUTPUT_WIDTH} step="1" value={draft}
            aria-describedby={error ? "multi-size-error multi-size-help" : "multi-size-help"}
            aria-invalid={error}
            onChange={(event) => { setDraft(event.target.value); setError(false); }}
            onKeyDown={(event) => {
              if (event.key === "Enter") { event.preventDefault(); add(); }
            }}
          />
        </label>
        <button type="button" onClick={add}>{t.multiSizeAdd}</button>
      </div>
      {error && <p id="multi-size-error" role="alert" className="historyError">{t.multiSizeError}</p>}
      <ul className="multiSizeWidths" aria-label={t.multiSizeTitle}>
        {widths.map((width) => (
          <li key={width}>
            <button type="button" aria-label={`${t.multiSizeRemove} ${width} px`} onClick={() => {
              onChange(widths.filter((item) => item !== width));
              setError(false);
              inputRef.current?.focus();
            }}>{width} px ×</button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
