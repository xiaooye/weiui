import { lintCode, type LintWarning } from "../lint.js";

// Empty deps — kept as an object for API symmetry with the other tools.
export type CheckUsageDeps = Record<string, never>;

export interface CheckUsageInput {
  /** Raw TSX source to lint. */
  code: string;
}

export interface CheckUsageOutput {
  warnings: LintWarning[];
}

/**
 * Lint a TSX snippet for common WeiUI-usage mistakes.
 */
export async function checkUsage(
  _deps: CheckUsageDeps,
  input: CheckUsageInput,
): Promise<CheckUsageOutput> {
  return { warnings: lintCode(input.code) };
}
