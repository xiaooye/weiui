"use client";
import { createContext, useContext, type ReactNode } from "react";

export interface WeiUILocale {
  select?: { noResults?: string; placeholder?: string };
  dialog?: { close?: string };
  pagination?: { next?: string; previous?: string };
  [key: string]: Record<string, string> | undefined;
}

interface WeiUIContextValue {
  locale: WeiUILocale;
}

const WeiUIContext = createContext<WeiUIContextValue>({ locale: {} });

export interface WeiUIProviderProps {
  children: ReactNode;
  locale?: WeiUILocale;
}

export function WeiUIProvider({ children, locale = {} }: WeiUIProviderProps) {
  return (
    <WeiUIContext.Provider value={{ locale }}>
      {children}
    </WeiUIContext.Provider>
  );
}

export function useWeiUI(): WeiUIContextValue {
  return useContext(WeiUIContext);
}
