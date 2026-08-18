export interface WeiIds {
  root: string;
  part(part: string, value?: string | number): string;
}

/** Create deterministic IDs. Adapters should normally provide their SSR-safe framework ID. */
export function createIds(component: string, providedId: string): WeiIds {
  const root = providedId.length > 0 ? providedId : component;
  return {
    root,
    part(part, value) {
      const suffix = value === undefined ? part : `${part}-${String(value)}`;
      return `${root}-${suffix}`;
    },
  };
}
