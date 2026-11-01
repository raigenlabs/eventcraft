import { MAX_STR_LEN } from "./constants.js";

/**
 * Sanitizes an unknown input to a safe trimmed string stripped of control characters with max length limit.
 */
export function sanitizeStr(val: unknown, maxLen: number = MAX_STR_LEN): string {
  return String(val ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLen);
}

/**
 * Clamps a numeric input between min and max bounds, returning fallback if invalid or non-finite.
 */
export function clampNumber(
  val: unknown,
  min: number,
  max: number,
  fallback: number = min,
): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
