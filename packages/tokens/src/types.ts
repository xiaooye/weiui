export interface DesignToken {
  $value: string | number;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export type TokenGroup = {
  [key: string]: TokenGroup | DesignToken;
};

export interface FlatToken {
  path: string[];
  token: DesignToken;
}

export function isDesignToken(node: unknown): node is DesignToken {
  return typeof node === "object" && node !== null && "$value" in node;
}
