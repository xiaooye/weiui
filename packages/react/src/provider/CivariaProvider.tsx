"use client";
import { createContext, useContext, type ReactNode } from "react";

export interface CivariaLocale {
  select?: { noResults?: string; placeholder?: string };
  dialog?: { close?: string };
  pagination?: { next?: string; previous?: string };
  [key: string]: Record<string, string> | undefined;
}

interface CivariaContextValue {
  locale: CivariaLocale;
}

const CivariaContext = createContext<CivariaContextValue>({ locale: {} });

export interface CivariaProviderProps {
  children: ReactNode;
  locale?: CivariaLocale;
}

export function CivariaProvider({ children, locale = {} }: CivariaProviderProps) {
  return (
    <CivariaContext.Provider value={{ locale }}>
      {children}
    </CivariaContext.Provider>
  );
}

export function useCivaria(): CivariaContextValue {
  return useContext(CivariaContext);
}
