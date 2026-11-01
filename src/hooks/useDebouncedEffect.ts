import { useEffect, type DependencyList } from "react";

/**
 * Executes an effect callback after a specified debounce delay when dependencies change.
 */
export function useDebouncedEffect(
  effect: () => void,
  deps: DependencyList,
  delayMs: number,
): void {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect();
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
}
