"use client";
import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";

export interface SearchInputProps extends Omit<InputProps, "type" | "startAddon"> {}

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

/**
 * Preset Input variant for search fields. Renders a magnifier icon before the
 * input and enables `clearable` by default. Pass `clearable={false}` to opt out.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ clearable = true, ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      startAddon={<SearchIcon />}
      clearable={clearable}
      {...props}
    />
  ),
);
SearchInput.displayName = "SearchInput";
