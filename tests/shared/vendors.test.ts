import assert from "node:assert/strict";
import test from "node:test";
import { getInitialVendors } from "../../shared/data/vendorItems.js";
import {
  getCategoryGuidanceFallback,
  updateVendorItem,
} from "../../shared/vendors.js";

test("updateVendorItem: updates status, quote and notes immutably", () => {
  const initial = getInitialVendors("wedding");
  const venueId = initial[0]?.id ?? "v_venue";

  const updatedRes = updateVendorItem(initial, venueId, {
    status: "quoted",
    quoteCents: 450000,
    notes: "Includes chairs and security deposit",
  });

  assert.equal(updatedRes.ok, true);
  if (updatedRes.ok) {
    const item = updatedRes.value.find((v) => v.id === venueId);
    assert.equal(item?.status, "quoted");
    assert.equal(item?.quoteCents, 450000);
    assert.equal(item?.notes, "Includes chairs and security deposit");

    // Immutability check
    assert.notEqual(initial, updatedRes.value);
    assert.equal(initial[0]?.status, "to-contact");
  }
});

test("updateVendorItem: quoted requires quote >= 0", () => {
  const initial = getInitialVendors("wedding");
  const venueId = initial[0]?.id ?? "v_venue";

  const validQuote = updateVendorItem(initial, venueId, {
    status: "quoted",
    quoteCents: 0,
  });
  assert.equal(validQuote.ok, true);

  const negativeQuote = updateVendorItem(initial, venueId, {
    status: "quoted",
    quoteCents: -50,
  });
  assert.equal(negativeQuote.ok, false);
});

test("updateVendorItem: rejects negative quotes or invalid item ID", () => {
  const initial = getInitialVendors("birthday");
  const itemId = initial[0]?.id ?? "v_b_venue";

  const negativeRes = updateVendorItem(initial, itemId, {
    quoteCents: -100,
  });
  assert.equal(negativeRes.ok, false);

  const missingRes = updateVendorItem(initial, "non_existent_id", {
    status: "contacted",
  });
  assert.equal(missingRes.ok, false);
});

test("getCategoryGuidanceFallback: returns questions and red flags for known and default categories", () => {
  const venueGuidance = getCategoryGuidanceFallback("venue");
  assert.ok(venueGuidance.questions.length >= 3);
  assert.ok(venueGuidance.redFlags.length >= 3);

  const unknownGuidance = getCategoryGuidanceFallback("unknown_category");
  assert.ok(unknownGuidance.questions.length >= 3);
  assert.ok(unknownGuidance.redFlags.length >= 3);
});
