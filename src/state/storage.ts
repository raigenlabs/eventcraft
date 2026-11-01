import { STORAGE_KEY } from "../../shared/constants.js";
import type { EventPlan } from "../../shared/types.js";
import { validateIntake } from "../../shared/validation.js";

function isValidPlanShape(parsed: unknown): parsed is EventPlan {
  if (!parsed || typeof parsed !== "object") return false;
  const candidate = parsed as Partial<EventPlan>;
  if (!Array.isArray(candidate.budget) || !Array.isArray(candidate.timeline) || !Array.isArray(candidate.vendors)) {
    return false;
  }
  return validateIntake(candidate.intake).ok;
}

/**
 * Safely loads and validates stored event plan from localStorage, returning null if empty or corrupted.
 */
export function loadStoredPlan(): EventPlan | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    return isValidPlanShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Safely persists an event plan to localStorage with silent error catching.
 */
export function saveStoredPlan(plan: EventPlan): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Graceful fallback if storage quota exceeded or disabled
  }
}

/**
 * Safely removes the stored event plan from localStorage.
 */
export function clearStoredPlan(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Graceful fallback
  }
}
