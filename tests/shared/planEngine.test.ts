import assert from "node:assert/strict";
import test from "node:test";
import { createPlan, replan } from "../../shared/planEngine.js";

const sampleIntake = {
  eventType: "wedding" as const,
  name: "Morgan & Taylor Celebration",
  date: "2026-10-10",
  guestCount: 150,
  totalBudgetCents: 4000000,
  currency: "USD" as const,
  city: "San Francisco",
  priorities: ["venue", "catering_bar"],
  themeNotes: "Sunset cocktail reception",
  guestNeeds: "Wheelchair ramp access",
  culturalTraditions: "Family toast",
};

test("createPlan: generates complete initial plan with budget, timeline, vendors, and warnings", () => {
  const planRes = createPlan(sampleIntake, "2026-04-01");
  assert.equal(planRes.ok, true);
  if (planRes.ok) {
    const plan = planRes.value;
    assert.equal(plan.intake.name, sampleIntake.name);
    assert.ok(plan.budget.length >= 8);
    assert.ok(plan.timeline.length >= 10);
    assert.ok(plan.vendors.length >= 8);
    assert.equal(plan.warnings.overBudgetCount, 0);
    assert.ok(plan.warnings.leadDays > 0);
  }
});

test("replan: preserves user progress by stable IDs when updating intake", () => {
  const initialRes = createPlan(sampleIntake, "2026-04-01");
  assert.equal(initialRes.ok, true);
  if (!initialRes.ok) return;

  const plan = initialRes.value;

  // Mark a task as completed
  const firstTaskId = plan.timeline[0]?.id ?? "w_venue";
  plan.timeline[0] = { ...plan.timeline[0]!, completed: true };

  // Set an actual spend on budget category
  const firstCatId = plan.budget[0]?.id ?? "venue";
  plan.budget[0] = { ...plan.budget[0]!, actualCents: 1200000 };

  // Replan with increased budget and new date
  const replanRes = replan(
    plan,
    { totalBudgetCents: 5000000, date: "2026-11-15" },
    "2026-04-01",
  );

  assert.equal(replanRes.ok, true);
  if (replanRes.ok) {
    const nextPlan = replanRes.value;
    assert.equal(nextPlan.intake.totalBudgetCents, 5000000);
    assert.equal(nextPlan.intake.date, "2026-11-15");

    // Completed task is preserved
    const task = nextPlan.timeline.find((t) => t.id === firstTaskId);
    assert.equal(task?.completed, true);

    // Actual spend is preserved
    const cat = nextPlan.budget.find((c) => c.id === firstCatId);
    assert.equal(cat?.actualCents, 1200000);
  }
});

test("replan: resets template items when switching event type", () => {
  const initialRes = createPlan(sampleIntake, "2026-04-01");
  assert.equal(initialRes.ok, true);
  if (!initialRes.ok) return;

  const replanRes = replan(initialRes.value, { eventType: "birthday" }, "2026-04-01");
  assert.equal(replanRes.ok, true);
  if (replanRes.ok) {
    assert.equal(replanRes.value.intake.eventType, "birthday");
    assert.ok(replanRes.value.budget.some((c) => c.id === "cake_desserts"));
  }
});

test("createPlan & replan: reject invalid intake or past date", () => {
  const pastRes = createPlan({ ...sampleIntake, date: "2025-01-01" }, "2026-04-01");
  assert.equal(pastRes.ok, false);

  const invalidIntakeRes = createPlan(null, "2026-04-01");
  assert.equal(invalidIntakeRes.ok, false);

  const initialRes = createPlan(sampleIntake, "2026-04-01");
  assert.equal(initialRes.ok, true);
  if (initialRes.ok) {
    const invalidReplan = replan(initialRes.value, { date: "2025-01-01" }, "2026-04-01");
    assert.equal(invalidReplan.ok, false);
  }
});
