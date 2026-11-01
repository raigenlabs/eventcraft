import { allocateBudget } from "./budget.js";
import { getInitialVendors } from "./data/vendorItems.js";
import { buildTimeline, isOverdue } from "./timeline.js";
import type {
  EventPlan,
  IntakeForm,
  PlanWarnings,
  ValidationResult,
} from "./types.js";
import { validateIntake } from "./validation.js";

function computePlanWarnings(
  budget: EventPlan["budget"],
  timeline: EventPlan["timeline"],
  scheduleMeta: { compressed: boolean; leadDays: number },
  today: string,
): PlanWarnings {
  const overBudgetCount = budget.filter((b) => b.actualCents > b.plannedCents).length;
  const overdueTaskCount = timeline.filter((t) => isOverdue(t, today)).length;
  return {
    compressedTimeline: scheduleMeta.compressed,
    leadDays: scheduleMeta.leadDays,
    overBudgetCount,
    overdueTaskCount,
  };
}

/**
 * Creates a complete event plan (budget, timeline, vendors, warnings) deterministically from intake.
 */
export function createPlan(
  rawIntake: unknown,
  today: string,
): ValidationResult<EventPlan> {
  const intakeRes = validateIntake(rawIntake);
  if (!intakeRes.ok) return intakeRes;
  const intake = intakeRes.value;

  const timelineRes = buildTimeline(intake.date, today, intake.eventType);
  if (!timelineRes.ok) return timelineRes;

  const budget = allocateBudget(
    intake.totalBudgetCents,
    intake.eventType,
    intake.priorities,
  );
  const timeline = timelineRes.value.timeline;
  const vendors = getInitialVendors(intake.eventType);
  const warnings = computePlanWarnings(
    budget,
    timeline,
    { compressed: timelineRes.value.compressed, leadDays: timelineRes.value.leadDays },
    today,
  );

  return {
    ok: true,
    value: { intake, budget, timeline, vendors, warnings },
  };
}

/**
 * Re-plans an existing event plan with an intake patch, preserving user progress by stable IDs.
 */
export function replan(
  plan: EventPlan,
  intakePatch: Partial<IntakeForm>,
  today: string,
): ValidationResult<EventPlan> {
  const mergedRaw = { ...plan.intake, ...intakePatch };
  const intakeRes = validateIntake(mergedRaw);
  if (!intakeRes.ok) return intakeRes;
  const nextIntake = intakeRes.value;

  const typeChanged = nextIntake.eventType !== plan.intake.eventType;
  if (typeChanged) {
    return createPlan(nextIntake, today);
  }

  const timelineRes = buildTimeline(nextIntake.date, today, nextIntake.eventType);
  if (!timelineRes.ok) return timelineRes;

  const nextAllocations = allocateBudget(
    nextIntake.totalBudgetCents,
    nextIntake.eventType,
    nextIntake.priorities,
  );

  const prevBudgetMap = new Map(plan.budget.map((b) => [b.id, b.actualCents]));
  const preservedBudget = nextAllocations.map((cat) => ({
    ...cat,
    actualCents: prevBudgetMap.get(cat.id) ?? 0,
  }));

  const prevTimelineMap = new Map(plan.timeline.map((t) => [t.id, t.completed]));
  const preservedTimeline = timelineRes.value.timeline.map((task) => ({
    ...task,
    completed: prevTimelineMap.get(task.id) ?? false,
  }));

  const warnings = computePlanWarnings(
    preservedBudget,
    preservedTimeline,
    { compressed: timelineRes.value.compressed, leadDays: timelineRes.value.leadDays },
    today,
  );

  return {
    ok: true,
    value: {
      intake: nextIntake,
      budget: preservedBudget,
      timeline: preservedTimeline,
      vendors: plan.vendors,
      warnings,
    },
  };
}
