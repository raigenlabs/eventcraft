import assert from "node:assert/strict";
import test from "node:test";
import {
  allocateBudget,
  calculateBudgetSummary,
  getBudgetStatus,
} from "../../shared/budget.js";
import { EVENT_TYPES } from "../../shared/constants.js";

test("allocateBudget: allocations sum exactly to totalMinor across various amounts", () => {
  const testTotals = [
    0, 1, 2, 7, 10, 99, 100, 101, 1000, 12345, 999999, 5000000, 1000000000,
  ];

  for (const type of EVENT_TYPES) {
    for (const total of testTotals) {
      const budget = allocateBudget(total, type, []);
      const sum = budget.reduce((acc, cat) => acc + cat.plannedCents, 0);
      assert.equal(
        sum,
        total,
        `Failed sum match for type ${type} with total ${total}`,
      );
    }
  }
});

test("allocateBudget: priority weighting boosts priority categories without breaching total sum", () => {
  const total = 5000000;
  const standard = allocateBudget(total, "wedding", []);
  const boosted = allocateBudget(total, "wedding", ["venue", "catering_bar"]);

  const standardVenue = standard.find((c) => c.id === "venue")?.plannedCents ?? 0;
  const boostedVenue = boosted.find((c) => c.id === "venue")?.plannedCents ?? 0;
  assert.ok(
    boostedVenue > standardVenue,
    "Priority venue should receive higher planned allocation",
  );

  const sum = boosted.reduce((acc, cat) => acc + cat.plannedCents, 0);
  assert.equal(sum, total);
});

test("allocateBudget: contingency floor is never reduced below template share", () => {
  const total = 1000000; // $10,000
  // Wedding contingency template is 5% -> 50,000 cents
  const standard = allocateBudget(total, "wedding", []);
  const standardContingency = standard.find((c) => c.isContingency)?.plannedCents ?? 0;

  const boosted = allocateBudget(total, "wedding", ["venue", "catering_bar"]);
  const boostedContingency = boosted.find((c) => c.isContingency)?.plannedCents ?? 0;

  assert.ok(
    boostedContingency >= standardContingency - 1, // largest remainder may vary by 1 cent rounding
    "Contingency should maintain its template share",
  );
});

test("allocateBudget: deterministic tie breaking", () => {
  const run1 = allocateBudget(103, "birthday", ["decor_balloons"]);
  const run2 = allocateBudget(103, "birthday", ["decor_balloons"]);

  for (let i = 0; i < run1.length; i++) {
    assert.equal(run1[i]?.plannedCents, run2[i]?.plannedCents);
  }
});

test("getBudgetStatus: correctly flags under, near, and over", () => {
  assert.equal(getBudgetStatus(1000, 500), "under");
  assert.equal(getBudgetStatus(1000, 899), "under");
  assert.equal(getBudgetStatus(1000, 900), "near");
  assert.equal(getBudgetStatus(1000, 1000), "near");
  assert.equal(getBudgetStatus(1000, 1001), "over");
  assert.equal(getBudgetStatus(0, 50), "over");
  assert.equal(getBudgetStatus(0, 0), "under");
});

test("calculateBudgetSummary: calculates aggregates accurately", () => {
  const cats = [
    {
      id: "a",
      name: "A",
      percentage: 50,
      plannedCents: 5000,
      actualCents: 4800,
      isPriority: false,
      isContingency: false,
    },
    {
      id: "b",
      name: "B",
      percentage: 50,
      plannedCents: 5000,
      actualCents: 5200,
      isPriority: false,
      isContingency: false,
    },
  ];

  const summary = calculateBudgetSummary(cats, 50);
  assert.equal(summary.totalPlannedCents, 10000);
  assert.equal(summary.totalActualCents, 10000);
  assert.equal(summary.remainingCents, 0);
  assert.equal(summary.perGuestCostCents, 200); // 10000 / 50
  assert.equal(summary.overBudgetCount, 1);
});
