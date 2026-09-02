import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Translation } from "../lib/i18n";
import {
  parseSavedPresets,
  SAVED_PRESETS_STORAGE_KEY,
  upsertSavedPreset,
  type SavedPreset
} from "../lib/savedPresets";
import type { ImageSettings } from "../lib/types";

type Props = {
  settings: ImageSettings;
  activePresetId?: string;
  t: Translation;
  onApply: (preset: SavedPreset) => void;
  onActiveChange: (presetId?: string) => void;
};

export default function SavedPresetManager({ settings, activePresetId, t, onApply, onActiveChange }: Props) {
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function loadPresets() {
      try {
        setPresets(parseSavedPresets(window.localStorage.getItem(SAVED_PRESETS_STORAGE_KEY)));
      } catch {
        setMessage(t.presetStorageError);
      }
    }

    loadPresets();
    window.addEventListener("storage", loadPresets);
    return () => window.removeEventListener("storage", loadPresets);
  }, []);

  function persist(next: SavedPreset[]): boolean {
    try {
      window.localStorage.setItem(SAVED_PRESETS_STORAGE_KEY, JSON.stringify(next));
      setPresets(next);
      return true;
    } catch {
      setMessage(t.presetStorageError);
      return false;
    }
  }

  function savePreset() {
    try {
      const next = upsertSavedPreset(presets, name, settings, crypto.randomUUID(), new Date().toISOString());
      if (persist(next.presets)) {
        setName(next.saved.name);
        onActiveChange(next.saved.id);
        setMessage(t.presetSaved);
      }
    } catch {
      setMessage(t.presetNameRequired);
    }
  }

  function selectPreset(id: string) {
    const preset = presets.find((candidate) => candidate.id === id);
    if (!preset) {
      onActiveChange(undefined);
      return;
    }

    setName(preset.name);
    setMessage("");
    onApply(preset);
  }

  function deletePreset() {
    if (!activePresetId) {
      return;
    }

    const next = presets.filter((preset) => preset.id !== activePresetId);
    if (persist(next)) {
      setName("");
      onActiveChange(undefined);
      setMessage(t.presetDeleted);
    }
  }

  return (
    <div className="savedPresetManager">
      <label>
        {t.savedPresets}
        <select value={activePresetId ?? ""} onChange={(event) => selectPreset(event.target.value)}>
          <option value="">{t.noSavedPresets}</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </label>
      <div className="savedPresetEditor">
        <label>
          {t.presetName}
          <input
            maxLength={40}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                savePreset();
              }
            }}
          />
        </label>
        <button type="button" onClick={savePreset} title={t.savePreset}>
          <Save aria-hidden="true" />
          <span>{t.savePreset}</span>
        </button>
        <button type="button" onClick={deletePreset} disabled={!activePresetId} title={t.deletePreset}>
          <Trash2 aria-hidden="true" />
          <span>{t.deletePreset}</span>
        </button>
      </div>
      <small className="controlHint" role="status" aria-live="polite">{message}</small>
    </div>
  );
}
