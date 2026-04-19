"use client";
import { useEffect, useState } from "react";

export interface PlaygroundState {
  component: string;
  props: Record<string, unknown>;
  theme: "auto" | "light" | "dark";
  viewport: "mobile" | "tablet" | "desktop" | "full";
}

const DEFAULTS: PlaygroundState = {
  component: "Button",
  props: {},
  theme: "auto",
  viewport: "full",
};
const URL_LIMIT = 4096;
const LS_KEY = "wui-playground-state";

export function encodeState(s: PlaygroundState): string {
  const params = new URLSearchParams();
  params.set("c", s.component);
  const propsJson = JSON.stringify(s.props);
  if (propsJson.length < 3000) {
    params.set("p", btoa(unescape(encodeURIComponent(propsJson))));
  }
  if (s.theme !== "auto") params.set("t", s.theme);
  if (s.viewport !== "full") params.set("v", s.viewport);
  let out = params.toString();
  if (out.length > URL_LIMIT) out = out.slice(0, URL_LIMIT);
  return out;
}

export function decodeState(query: string): PlaygroundState {
  const params = new URLSearchParams(query);
  let props: Record<string, unknown> = {};
  try {
    const p = params.get("p");
    if (p) props = JSON.parse(decodeURIComponent(escape(atob(p)))) as Record<string, unknown>;
  } catch {
    props = {};
  }
  return {
    component: params.get("c") ?? DEFAULTS.component,
    props,
    theme: (params.get("t") as PlaygroundState["theme"]) ?? DEFAULTS.theme,
    viewport: (params.get("v") as PlaygroundState["viewport"]) ?? DEFAULTS.viewport,
  };
}

export function useSyncPlaygroundState(): [
  PlaygroundState,
  (patch: Partial<PlaygroundState>) => void,
] {
  const [state, setState] = useState<PlaygroundState>(DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search.slice(1);
    if (search) {
      setState(decodeState(search));
      return;
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setState(JSON.parse(raw) as PlaygroundState);
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch {
        // ignore quota / disabled storage
      }
      const enc = encodeState(state);
      const url = `${window.location.pathname}?${enc}`;
      window.history.replaceState(null, "", url);
    }, 300);
    return () => clearTimeout(h);
  }, [state]);

  return [
    state,
    (patch) =>
      setState((prev) => ({
        ...prev,
        ...patch,
        props: patch.props ?? prev.props,
      })),
  ];
}
