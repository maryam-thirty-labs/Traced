import { useSyncExternalStore } from "react";

const KEY = "traced_evidence_mode";
const EVENT = "traced:evidenceModeChanged";

function read(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "true";
}

export function isEvidenceModeEnabled(): boolean {
  return read();
}

export function setEvidenceModeEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useEvidenceMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    read,
    () => false,
  );
}
