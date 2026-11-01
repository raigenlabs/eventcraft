import { NEAR_BUDGET_THRESHOLD, PRIORITY_MULTIPLIER } from "./constants.js";
import {
  type BudgetTemplateCategory,
  getBudgetTemplate,
} from "./data/budgetTemplates.js";
import type { BudgetCategory, BudgetStatus, EventType } from "./types.js";

interface RemainderEntry {
  index: number;
  remainder: number;
}

function computeEffectiveShares(
  template: readonly BudgetTemplateCategory[],
  priorities: string[],
): number[] {
  let contingencyShare = 0;
  let nonContingencyWeightSum = 0;
  const weights: number[] = [];

  for (const cat of template) {
    if (cat.isContingency) {
      contingencyShare += cat.percentage;
      weights.push(0);
    } else {
      const isPriority = priorities.includes(cat.id);
      const w = isPriority ? cat.percentage * PRIORITY_MULTIPLIER : cat.percentage;
      weights.push(w);
      nonContingencyWeightSum += w;
    }
  }

  const availableShare = Math.max(0, 100 - contingencyShare);
  return template.map((cat, i) => {
    if (cat.isContingency) {
      return cat.percentage;
    }
    if (nonContingencyWeightSum === 0) {
      return 0;
    }
    const weight = weights[i] ?? 0;
    return (weight / nonContingencyWeightSum) * availableShare;
  });
}

function distributeLargestRemainder(
  totalMinor: number,
  effectiveShares: number[],
): number[] {
  if (totalMinor <= 0) {
    return effectiveShares.map(() => 0);
  }

  const floors: number[] = [];
  const remainders: RemainderEntry[] = [];
  let allocatedSum = 0;

  for (let i = 0; i < effectiveShares.length; i++) {
    const share = effectiveShares[i] ?? 0;
    const exactQuota = (totalMinor * share) / 100;
    const floorVal = Math.floor(exactQuota);
    floors.push(floorVal);
    allocatedSum += floorVal;
    remainders.push({ index: i, remainder: exactQuota - floorVal });
  }

  const surplus = totalMinor - allocatedSum;
  remainders.sort((a, b) => {
    const diff = b.remainder - a.remainder;
    return Math.abs(diff) > 1e-9 ? diff : a.index - b.index;
  });

  for (let k = 0; k < surplus; k++) {
    const entry = remainders[k % remainders.length];
    if (entry) {
      const idx = entry.index;
      floors[idx] = (floors[idx] ?? 0) + 1;
    }
  }

  return floors;
}

/**
 * Allocates budget minor units across categories using the largest-remainder method with priority weighting.
 */
export function allocateBudget(
  totalMinor: number,
  eventType: EventType,
  priorities: string[],
): BudgetCategory[] {
  const template = getBudgetTemplate(eventType);
  const effectiveShares = computeEffectiveShares(template, priorities);
  const allocations = distributeLargestRemainder(totalMinor, effectiveShares);

  return template.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    percentage: cat.percentage,
    plannedCents: allocations[idx] ?? 0,
    actualCents: 0,
    isPriority: priorities.includes(cat.id),
    isContingency: Boolean(cat.isContingency),
  }));
}

/**
 * Determines whether a category spend is under, near (>=90%), or over planned amount.
 */
export function getBudgetStatus(
  plannedCents: number,
  actualCents: number,
): BudgetStatus {
  if (actualCents > plannedCents) {
    return "over";
  }
  if (plannedCents > 0 && actualCents >= plannedCents * NEAR_BUDGET_THRESHOLD) {
    return "near";
  }
  return "under";
}

/**
 * Calculates aggregate budget statistics including total planned, total actual, remaining, and per-guest cost.
 */
export function calculateBudgetSummary(
  categories: BudgetCategory[],
  guestCount: number,
): {
  totalPlannedCents: number;
  totalActualCents: number;
  remainingCents: number;
  perGuestCostCents: number;
  overBudgetCount: number;
} {
  let totalPlannedCents = 0;
  let totalActualCents = 0;
  let overBudgetCount = 0;

  for (const cat of categories) {
    totalPlannedCents += cat.plannedCents;
    totalActualCents += cat.actualCents;
    if (cat.actualCents > cat.plannedCents) {
      overBudgetCount++;
    }
  }

  const remainingCents = totalPlannedCents - totalActualCents;
  const safeGuests = Math.max(1, guestCount);
  const perGuestCostCents = Math.round(totalActualCents > 0 ? totalActualCents / safeGuests : totalPlannedCents / safeGuests);

  return {
    totalPlannedCents,
    totalActualCents,
    remainingCents,
    perGuestCostCents,
    overBudgetCount,
  };
}
