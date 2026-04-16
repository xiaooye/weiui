import { useId as reactUseId } from "react";

export function useId(prefix?: string): string {
  const id = reactUseId();
  return prefix ? `${prefix}-${id}` : `wui-${id}`;
}
