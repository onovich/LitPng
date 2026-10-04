import { useMemo, useRef, useState } from "react";
import type { Translation } from "../lib/i18n";
import type { ImageJob } from "../lib/types";
import { responsiveImages, srcsetMarkup } from "../lib/srcset";
import { downloadBlob } from "../lib/zip";

export default function SrcsetExport({ jobs, t }: { jobs: ImageJob[]; t: Translation }) {
  const [sizes, setSizes] = useState("100vw");
  const [notice, setNotice] = useState<{ markup: string; kind: "copied" | "failed" }>();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const groups = useMemo(() => responsiveImages(jobs), [jobs]);
  const markup = useMemo(() => srcsetMarkup(groups, sizes), [groups, sizes]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markup);
      setNotice({ markup, kind: "copied" });
    } catch {
      setNotice({ markup, kind: "failed" });
      textarea.current?.focus();
      textarea.current?.select();
    }
  }

  if (!jobs.some((job) => job.variantWidth !== undefined)) return null;
  return (
    <details className="srcsetExport">
      <summary>{t.srcsetTitle}</summary>
      <p id="srcset-help">{t.srcsetHelp}</p>
      {groups.length === 0 ? <p role="status">{t.srcsetEmpty}</p> : <>
        <label htmlFor="srcset-sizes">{t.srcsetSizes}</label>
        <input id="srcset-sizes" value={sizes} aria-describedby="srcset-help"
          onChange={(event) => setSizes(event.target.value)} placeholder="100vw" />
        <label htmlFor="srcset-code">{t.srcsetCode}</label>
        <textarea id="srcset-code" ref={textarea} readOnly value={markup} rows={12}
          spellCheck={false} aria-describedby="srcset-help" />
        <div className="srcsetActions">
          <button type="button" onClick={() => void copy()}>{t.srcsetCopy}</button>
          <button type="button" onClick={() => downloadBlob(
            new Blob([markup], { type: "text/html;charset=utf-8" }), "littlepng-srcset.html"
          )}>{t.srcsetDownload}</button>
        </div>
        <p role="status">{notice?.markup === markup
          ? notice.kind === "copied" ? t.srcsetCopied : t.srcsetCopyFailed : ""}</p>
      </>}
    </details>
  );
}
