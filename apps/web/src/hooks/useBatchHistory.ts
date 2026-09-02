import { useEffect, useRef, useState } from "react";
import {
  HISTORY_STORAGE_KEY, MAX_HISTORY_ENTRIES, parseBatchHistory, serializeBatchHistory,
  type BatchHistoryEntry, type BatchHistoryState
} from "../lib/batchHistory";

export function useBatchHistory() {
  const [state, setState] = useState<BatchHistoryState>({ enabled: false, entries: [] });
  const [storageError, setStorageError] = useState(false);
  const current = useRef(state);
  const generation = useRef(0);

  useEffect(() => {
    function load(event?: StorageEvent) {
      if (event && event.key !== null && event.key !== HISTORY_STORAGE_KEY) return;
      generation.current += 1;
      try {
        const loaded = parseBatchHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
        current.current = loaded;
        setState(loaded);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  function persist(next: BatchHistoryState) {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, serializeBatchHistory(next));
      current.current = next;
      setState(next);
      setStorageError(false);
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  }

  return {
    ...state,
    storageError,
    setEnabled(enabled: boolean) {
      generation.current += 1;
      // Disabling must take effect immediately, even if persistence is blocked.
      if (!enabled) {
        current.current = { ...current.current, enabled: false };
        setState(current.current);
      }
      persist({ ...current.current, enabled });
    },
    beginBatch() {
      return current.current.enabled ? generation.current : undefined;
    },
    recordBatch(token: number | undefined, entry: BatchHistoryEntry | undefined) {
      if (token === undefined || token !== generation.current || !current.current.enabled || !entry) return;
      persist({ ...current.current, entries: [entry, ...current.current.entries].slice(0, MAX_HISTORY_ENTRIES) });
    },
    removeEntry(id: string) {
      return persist({ ...current.current, entries: current.current.entries.filter((entry) => entry.id !== id) });
    },
    clear() {
      generation.current += 1;
      return persist({ ...current.current, entries: [] });
    }
  };
}
