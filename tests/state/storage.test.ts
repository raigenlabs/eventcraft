import assert from "node:assert/strict";
import test from "node:test";
import { STORAGE_KEY } from "../../shared/constants.js";
import { createPlan } from "../../shared/planEngine.js";
import {
  clearStoredPlan,
  loadStoredPlan,
  saveStoredPlan,
} from "../../src/state/storage.js";

const sampleIntake = {
  eventType: "wedding" as const,
  name: "Sam & Casey",
  date: "2026-11-20",
  guestCount: 80,
  totalBudgetCents: 2500000,
  currency: "USD" as const,
  city: "Chicago",
  priorities: ["venue"],
  themeNotes: "Modern autumn",
  guestNeeds: "Vegetarian options",
  culturalTraditions: "",
};

test("storage: saveStoredPlan and loadStoredPlan round-trip correctly", () => {
  const plan = (createPlan(sampleIntake, "2026-05-01") as { ok: true; value: unknown }).value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveStoredPlan(plan as any);

  const loaded = loadStoredPlan();
  assert.ok(loaded);
  assert.equal(loaded?.intake.name, "Sam & Casey");
  assert.equal(loaded?.intake.totalBudgetCents, 2500000);
});

test("storage: handles corrupted JSON gracefully by returning null", () => {
  window.localStorage.setItem(STORAGE_KEY, "{ invalid json ]");
  const loaded = loadStoredPlan();
  assert.equal(loaded, null);
});

test("storage: handles invalid schema or missing fields gracefully by returning null", () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ intake: { name: "" } }));
  const loaded = loadStoredPlan();
  assert.equal(loaded, null);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify("not-an-object"));
  assert.equal(loadStoredPlan(), null);
});

test("storage: clearStoredPlan removes item from storage", () => {
  window.localStorage.setItem(STORAGE_KEY, "something");
  clearStoredPlan();
  assert.equal(window.localStorage.getItem(STORAGE_KEY), null);
});
