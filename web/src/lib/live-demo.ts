"use client";

export type RequestStatus = "pending" | "approved" | "played" | "rejected";
export type SongRequest = {
  id: string;
  song: string;
  artist?: string;
  name?: string; // requester name
  status: RequestStatus;
  time: number; // epoch ms
};

export type LiveState = {
  active: boolean;
  requests: SongRequest[];
};

const STORAGE_KEY = "wj-live-state-v1";
const EVENT = "wj-live-updated";

function now() {
  return Date.now();
}

function safeParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getState(): LiveState {
  if (typeof window === "undefined") return { active: false, requests: [] };
  const raw = localStorage.getItem(STORAGE_KEY);
  return (
    safeParse<LiveState>(raw, { active: false, requests: [] }) || {
      active: false,
      requests: [],
    }
  );
}

function setState(next: LiveState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function onChange(cb: (s: LiveState) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<LiveState>).detail;
    cb(detail ?? getState());
  };
  window.addEventListener(EVENT, handler as EventListener);
  window.addEventListener("storage", () => cb(getState()));
  return () => {
    window.removeEventListener(EVENT, handler as EventListener);
    window.removeEventListener("storage", () => cb(getState()));
  };
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Actions
export const LiveActions = {
  toggleActive() {
    const s = getState();
    setState({ ...s, active: !s.active });
  },
  addRequest(input: { song: string; artist?: string; name?: string }) {
    const s = getState();
    const req: SongRequest = {
      id: uid(),
      song: input.song,
      artist: input.artist,
      name: input.name,
      status: "pending",
      time: now(),
    };
    setState({ ...s, requests: [req, ...s.requests] });
    return req;
  },
  setStatus(id: string, status: RequestStatus) {
    const s = getState();
    setState({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    });
  },
  remove(id: string) {
    const s = getState();
    setState({ ...s, requests: s.requests.filter((r) => r.id !== id) });
  },
  clear() {
    const s = getState();
    setState({ ...s, requests: [] });
  },
};

