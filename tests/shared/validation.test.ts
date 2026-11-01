import assert from "node:assert/strict";
import test from "node:test";
import {
  validateCurrency,
  validateDate,
  validateEventType,
  validateIntake,
  validateVendorStatus,
} from "../../shared/validation.js";

test("validateDate: accepts valid calendar dates", () => {
  const res1 = validateDate("2026-12-31");
  assert.equal(res1.ok, true);
  if (res1.ok) assert.equal(res1.value, "2026-12-31");

  const res2 = validateDate("2024-02-29"); // leap year
  assert.equal(res2.ok, true);
});

test("validateDate: rejects invalid dates, leap day on non-leap year, and malformed strings", () => {
  assert.equal(validateDate("2025-02-29").ok, false); // non-leap year
  assert.equal(validateDate("2026-04-31").ok, false); // April has 30 days
  assert.equal(validateDate("not-a-date").ok, false);
  assert.equal(validateDate("").ok, false);
  assert.equal(validateDate(null).ok, false);
  assert.equal(validateDate(12345).ok, false);
  assert.equal(validateDate("2026-13-01").ok, false);
});

test("validateEventType & validateCurrency: accept valid items and reject unknown", () => {
  assert.equal(validateEventType("wedding").ok, true);
  assert.equal(validateEventType("birthday").ok, true);
  assert.equal(validateEventType("community").ok, true);
  assert.equal(validateEventType("corporate").ok, false);

  assert.equal(validateCurrency("USD").ok, true);
  assert.equal(validateCurrency("EUR").ok, true);
  assert.equal(validateCurrency("XYZ").ok, false);
});

test("validateVendorStatus: accepts valid statuses only", () => {
  assert.equal(validateVendorStatus("to-contact").ok, true);
  assert.equal(validateVendorStatus("contacted").ok, true);
  assert.equal(validateVendorStatus("quoted").ok, true);
  assert.equal(validateVendorStatus("booked").ok, true);
  assert.equal(validateVendorStatus("cancelled").ok, false);
});

test("validateIntake: validates full valid intake and rejects errors", () => {
  const valid = {
    eventType: "wedding",
    name: "Alex & Jordan Wedding",
    date: "2026-09-15",
    guestCount: 120,
    totalBudgetCents: 3500000,
    currency: "USD",
    city: "Seattle",
    priorities: ["venue", "catering_bar"],
    themeNotes: "Garden party style",
    guestNeeds: "Vegan options",
    culturalTraditions: "Tea ceremony",
  };

  const res = validateIntake(valid);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.name, "Alex & Jordan Wedding");
    assert.equal(res.value.guestCount, 120);
    assert.equal(res.value.totalBudgetCents, 3500000);
  }

  // Missing name
  assert.equal(validateIntake({ ...valid, name: "" }).ok, false);

  // Guest count out of bounds
  assert.equal(validateIntake({ ...valid, guestCount: 0 }).ok, false);
  assert.equal(validateIntake({ ...valid, guestCount: 10000 }).ok, false);

  // Budget negative
  assert.equal(validateIntake({ ...valid, totalBudgetCents: -500 }).ok, false);

  // More than 3 priorities
  assert.equal(
    validateIntake({ ...valid, priorities: ["a", "b", "c", "d"] }).ok,
    false,
  );

  // Non-object
  assert.equal(validateIntake(null).ok, false);
  assert.equal(validateIntake("string").ok, false);
});
