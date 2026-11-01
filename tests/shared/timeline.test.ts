import assert from "node:assert/strict";
import test from "node:test";
import { buildTimeline, isOverdue } from "../../shared/timeline.js";
import type { TimelineTask } from "../../shared/types.js";

test("buildTimeline: normal lead schedule with uncompressed offsets", () => {
  const today = "2026-01-01";
  const eventDate = "2027-01-01"; // 365 days away
  const res = buildTimeline(eventDate, today, "wedding");

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.compressed, false);
    assert.equal(res.value.leadDays, 365);
    const venueTask = res.value.timeline.find((t) => t.id === "w_venue");
    assert.equal(venueTask?.daysBefore, 365);
    assert.equal(venueTask?.dueDate, "2026-01-01");
  }
});

test("buildTimeline: compressed lead schedule scales offsets proportionally", () => {
  const today = "2026-06-01";
  const eventDate = "2026-09-01"; // ~92 days away (< 365)
  const res = buildTimeline(eventDate, today, "wedding");

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.compressed, true);
    assert.ok(res.value.leadDays < 365);
    for (const task of res.value.timeline) {
      assert.ok(task.daysBefore <= res.value.leadDays);
      assert.ok(task.dueDate <= eventDate);
      assert.ok(task.dueDate >= today);
    }
  }
});

test("buildTimeline: rejects event dates in the past", () => {
  const today = "2026-06-01";
  const pastEvent = "2026-05-31";
  const res = buildTimeline(pastEvent, today, "birthday");
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.match(res.error, /past/i);
  }
});

test("buildTimeline: same-day and next-day events", () => {
  const today = "2026-06-01";
  const sameDay = buildTimeline(today, today, "birthday");
  assert.equal(sameDay.ok, true);
  if (sameDay.ok) {
    assert.equal(sameDay.value.leadDays, 0);
    assert.equal(sameDay.value.compressed, true);
    for (const task of sameDay.value.timeline) {
      assert.equal(task.dueDate, today);
    }
  }

  const nextDay = buildTimeline("2026-06-02", today, "birthday");
  assert.equal(nextDay.ok, true);
  if (nextDay.ok) {
    assert.equal(nextDay.value.leadDays, 1);
  }
});

test("buildTimeline: handles leap-year and DST boundary transitions cleanly in UTC", () => {
  // 2028 is a leap year; crosses Feb 29
  const today = "2028-02-01";
  const eventDate = "2028-03-15"; // 43 days
  const res = buildTimeline(eventDate, today, "community");
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.leadDays, 43);
  }
});

test("isOverdue: correctly assesses overdue status based on injected today and completion", () => {
  const task: TimelineTask = {
    id: "test",
    title: "Test Task",
    category: "venue",
    daysBefore: 10,
    dueDate: "2026-06-01",
    essential: true,
    completed: false,
  };

  assert.equal(isOverdue(task, "2026-05-31"), false);
  assert.equal(isOverdue(task, "2026-06-01"), false);
  assert.equal(isOverdue(task, "2026-06-02"), true);

  // If completed, never overdue
  assert.equal(isOverdue({ ...task, completed: true }, "2026-06-02"), false);
});
