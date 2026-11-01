import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import React from "react";
import { createPlan } from "../../shared/planEngine.js";
import App from "../../src/App.js";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const sampleIntake = {
  eventType: "wedding" as const,
  name: "Morgan & Taylor Wedding",
  date: "2026-10-15",
  guestCount: 100,
  totalBudgetCents: 3000000,
  currency: "USD" as const,
  city: "Seattle",
  priorities: ["venue"],
  themeNotes: "Botanical",
  guestNeeds: "Vegan",
  culturalTraditions: "",
};

test("App: renders skip link, landmarks, and navigation", () => {
  render(<App />);
  const skipLink = screen.getByRole("link", { name: /skip to main content/i });
  assert.ok(skipLink);

  const heading = screen.getByRole("heading", { level: 1, name: /eventcraft/i });
  assert.ok(heading);

  const nav = screen.getByRole("navigation", { name: /plan sections/i });
  assert.ok(nav);
});

test("Wizard: renders form controls and creates plan on valid submission", () => {
  render(<App />);

  // Fill in wizard Step 1
  const nameInput = screen.getByLabelText(/event name/i);
  fireEvent.change(nameInput, { target: { value: "Summer Community Picnic" } });

  const dateInput = screen.getByLabelText(/event date/i);
  fireEvent.change(dateInput, { target: { value: "2027-06-15" } });

  const toStep2Btn = screen.getByRole("button", { name: /continue to budget/i });
  fireEvent.click(toStep2Btn);

  // Step 2
  const budgetInput = screen.getByLabelText(/total planned budget/i);
  fireEvent.change(budgetInput, { target: { value: "10000" } });

  const toStep3Btn = screen.getByRole("button", { name: /continue to style/i });
  fireEvent.click(toStep3Btn);

  // Step 3 submit
  const submitBtn = screen.getByRole("button", { name: /generate event plan/i });
  fireEvent.click(submitBtn);

  // Verify transition to budget planner
  const budgetH2 = screen.getByRole("heading", { level: 2, name: /budget planner/i });
  assert.ok(budgetH2);
});

test("Budget: shows allocations, edits actual spend, and displays over-budget warning", () => {
  const futureIntake = { ...sampleIntake, date: "2027-09-20" };
  const plan = (createPlan(futureIntake, "2026-11-01") as { ok: true; value: unknown }).value;
  render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <App initialStateOverride={{ plan: plan as any, lastSavedAt: 0 }} />,
  );

  const budgetH2 = screen.getByRole("heading", { level: 2, name: /budget planner/i });
  assert.ok(budgetH2);

  // Edit actual spend for Venue
  const venueActualInput = screen.getByLabelText(/actual spend for venue/i);
  fireEvent.change(venueActualInput, { target: { value: "999999" } });

  // Over budget badge should appear
  const overBadge = screen.getByText(/over by/i);
  assert.ok(overBadge);
});

test("Timeline: allows navigating and toggling milestones", () => {
  const futureIntake = { ...sampleIntake, date: "2027-09-20" };
  const plan = (createPlan(futureIntake, "2026-11-01") as { ok: true; value: unknown }).value;
  render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <App initialStateOverride={{ plan: plan as any, lastSavedAt: 0 }} />,
  );

  // Click Timeline nav button
  const timelineNavBtn = screen.getByRole("button", { name: /^timeline$/i });
  fireEvent.click(timelineNavBtn);

  const timelineH2 = screen.getByRole("heading", { level: 2, name: /timeline & milestones/i });
  assert.ok(timelineH2);

  // Toggle milestone checkbox
  const checkboxes = screen.getAllByRole("checkbox");
  assert.ok(checkboxes.length > 0);
  fireEvent.click(checkboxes[0]!);

  const completedMatches = screen.getAllByText(/completed/i);
  assert.ok(completedMatches.length > 0);
});

test("Vendors & Reset: allows navigating to vendors and resetting plan", () => {
  const futureIntake = { ...sampleIntake, date: "2027-09-20" };
  const plan = (createPlan(futureIntake, "2026-11-01") as { ok: true; value: unknown }).value;
  render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <App initialStateOverride={{ plan: plan as any, lastSavedAt: 0 }} />,
  );

  // Navigate to Vendors
  const vendorNavBtn = screen.getByRole("button", { name: /^vendors$/i });
  fireEvent.click(vendorNavBtn);

  const vendorH2 = screen.getByRole("heading", { level: 2, name: /vendor checklist/i });
  assert.ok(vendorH2);

  // Click Reset New Plan
  const newPlanBtn = screen.getByRole("button", { name: /new plan/i });
  fireEvent.click(newPlanBtn);

  const confirmBtn = screen.getByRole("button", { name: /confirm/i });
  fireEvent.click(confirmBtn);

  // Should return to empty intake wizard
  const wizardH2 = screen.getByRole("heading", { level: 2, name: /create your event plan/i });
  assert.ok(wizardH2);
});
