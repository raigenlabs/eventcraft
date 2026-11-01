import assert from "node:assert/strict";
import test from "node:test";
import { createPlan } from "../../shared/planEngine.js";
import {
  initialPlanState,
  planReducer,
  type PlanAction,
  type PlanState,
} from "../../src/state/planReducer.js";

const sampleIntake = {
  eventType: "birthday" as const,
  name: "Riley's 30th",
  date: "2026-08-10",
  guestCount: 40,
  totalBudgetCents: 150000,
  currency: "USD" as const,
  city: "Denver",
  priorities: ["food_drinks"],
  themeNotes: "Golden hour",
  guestNeeds: "Gluten-free cake",
  culturalTraditions: "",
};

test("planReducer: handles SET_PLAN and RESET_PLAN", () => {
  const plan = createPlan(sampleIntake, "2026-05-01").ok
    ? (createPlan(sampleIntake, "2026-05-01") as { ok: true; value: unknown }).value
    : null;
  assert.ok(plan);

  const state1 = planReducer(initialPlanState, {
    type: "SET_PLAN",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: plan as any,
  });
  assert.equal(state1.plan?.intake.name, "Riley's 30th");

  const state2 = planReducer(state1, { type: "RESET_PLAN" });
  assert.equal(state2.plan, null);
});

test("planReducer: handles UPDATE_BUDGET_ACTUAL and recalculates overBudgetCount", () => {
  const planRes = createPlan(sampleIntake, "2026-05-01");
  assert.equal(planRes.ok, true);
  if (!planRes.ok) return;

  const state: PlanState = { plan: planRes.value, lastSavedAt: 0 };
  const firstCatId = state.plan!.budget[0]!.id;
  const planned = state.plan!.budget[0]!.plannedCents;

  const nextState = planReducer(state, {
    type: "UPDATE_BUDGET_ACTUAL",
    payload: { categoryId: firstCatId, actualCents: planned + 5000, today: "2026-05-01" },
  });

  assert.equal(nextState.plan?.warnings.overBudgetCount, 1);
  assert.equal(nextState.plan?.budget[0]?.actualCents, planned + 5000);
});

test("planReducer: handles TOGGLE_TIMELINE_TASK and recalculates overdueCount", () => {
  const planRes = createPlan(sampleIntake, "2026-05-01");
  assert.equal(planRes.ok, true);
  if (!planRes.ok) return;

  const state: PlanState = { plan: planRes.value, lastSavedAt: 0 };
  const taskId = state.plan!.timeline[0]!.id;

  const nextState = planReducer(state, {
    type: "TOGGLE_TIMELINE_TASK",
    payload: { taskId, today: "2026-05-01" },
  });

  assert.equal(nextState.plan?.timeline[0]?.completed, true);
});

test("planReducer: handles UPDATE_VENDOR immutably", () => {
  const planRes = createPlan(sampleIntake, "2026-05-01");
  assert.equal(planRes.ok, true);
  if (!planRes.ok) return;

  const state: PlanState = { plan: planRes.value, lastSavedAt: 0 };
  const vendorId = state.plan!.vendors[0]!.id;

  const nextState = planReducer(state, {
    type: "UPDATE_VENDOR",
    payload: { vendorId, patch: { status: "contacted", notes: "Sent introductory email" } },
  });

  assert.equal(nextState.plan?.vendors[0]?.status, "contacted");
  assert.equal(nextState.plan?.vendors[0]?.notes, "Sent introductory email");
});

test("planReducer: returns identical state for unknown action or no-op", () => {
  const state: PlanState = { plan: null, lastSavedAt: null };
  const next = planReducer(state, { type: "UNKNOWN_ACTION" } as unknown as PlanAction);
  assert.equal(next, state);
});
