import assert from "node:assert/strict";
import type { Server } from "node:http";
import test, { after, before } from "node:test";
import { getAssistantFallback, getSummaryFallback } from "../../server/ai/fallbacks.js";
import { type AiClient } from "../../server/ai/geminiClient.js";
import { createApp } from "../../server/app.js";
import { AppError } from "../../server/middleware/errors.js";
import { formatFallbackIdeasText } from "../../shared/data/fallbackIdeas.js";
import { createPlan } from "../../shared/planEngine.js";

let server: Server;
let baseUrl: string;

const mockAi: AiClient = {
  isConfigured: () => true,
  generateText: async () => "Generated summary text.",
  streamText: async function* () {
    yield "Summary chunk 1. ";
    yield "Summary chunk 2.";
  },
};

before(async () => {
  const app = createApp({ aiClient: mockAi });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

const sampleIntake = {
  eventType: "wedding" as const,
  name: "Morgan Wedding",
  date: "2027-10-15",
  guestCount: 100,
  totalBudgetCents: 2000000,
  currency: "USD" as const,
  city: "Austin",
  priorities: ["venue"],
  themeNotes: "Modern",
  guestNeeds: "None",
  culturalTraditions: "None",
};

test("POST /api/summary-stream: streams executive summary with meta and done", async () => {
  const plan = (createPlan(sampleIntake, "2026-11-01") as { ok: true; value: unknown }).value;
  const res = await fetch(`${baseUrl}/api/summary-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes("event: meta"));
  assert.ok(text.includes("event: done"));
});

test("POST /api/summary-stream: rejects invalid plan with 400", async () => {
  const res = await fetch(`${baseUrl}/api/summary-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: null }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/assistant-stream: rejects missing plan or empty message with 400", async () => {
  const res1 = await fetch(`${baseUrl}/api/assistant-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: null, message: "Hello" }),
  });
  assert.equal(res1.status, 400);

  const res2 = await fetch(`${baseUrl}/api/assistant-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: {}, message: "" }),
  });
  assert.equal(res2.status, 400);
});

test("POST /api/vendor-guidance: rejects empty category or invalid event type with 400", async () => {
  const res = await fetch(`${baseUrl}/api/vendor-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "", eventType: "invalid" }),
  });
  assert.equal(res.status, 400);
});

test("fallbacks & helpers: covers all fallback queries and formatters", () => {
  const plan = (createPlan(sampleIntake, "2026-11-01") as { ok: true; value: unknown }).value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = plan as any;

  const rainReply = getAssistantFallback(p, "Plan a rain backup");
  assert.ok(rainReply.includes("contingency"));

  const cutReply = getAssistantFallback(p, "Cut 10% from the budget");
  assert.ok(cutReply.includes("10%"));

  const genericReply = getAssistantFallback(p, "General tips");
  assert.ok(genericReply.includes("Planning guidance"));

  const summary = getSummaryFallback(p);
  assert.ok(summary.includes("Executive Event Plan Summary"));

  const ideasText = formatFallbackIdeasText(sampleIntake);
  assert.ok(ideasText.includes("Personalized Celebration Ideas"));

  const appErr = new AppError("Forbidden error", 403, "FORBIDDEN");
  assert.equal(appErr.statusCode, 403);
  assert.equal(appErr.code, "FORBIDDEN");
});
