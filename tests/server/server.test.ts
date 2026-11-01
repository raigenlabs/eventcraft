import assert from "node:assert/strict";
import type { Server } from "node:http";
import test, { after, before } from "node:test";
import { type AiClient } from "../../server/ai/geminiClient.js";
import { createApp } from "../../server/app.js";

let server: Server;
let baseUrl: string;

const mockAiClient: AiClient = {
  isConfigured: () => true,
  generateText: async (prompt: string) => {
    if (prompt.includes("fail_ai")) throw new Error("AI call failed");
    return JSON.stringify({
      questions: ["What is your overtime policy?"],
      redFlags: ["No written contract"],
    });
  },
  streamText: async function* (prompt: string) {
    if (prompt.includes("fail_ai")) throw new Error("AI stream failed");
    yield "Streamed chunk 1. ";
    yield "Streamed chunk 2.";
  },
};

const unconfiguredAiClient: AiClient = {
  isConfigured: () => false,
  generateText: async () => "",
  streamText: async function* () {
    yield* [];
  },
};

before(async () => {
  const app = createApp({ aiClient: mockAiClient });
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

const sampleValidIntake = {
  eventType: "wedding",
  name: "Morgan Wedding",
  date: "2026-10-15",
  guestCount: 100,
  totalBudgetCents: 2000000,
  currency: "USD",
  city: "Austin",
  priorities: ["venue"],
  themeNotes: "Modern",
  guestNeeds: "None",
  culturalTraditions: "None",
};

test("GET /api/health: returns 200 with status ok and nosniff header", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  const data = await res.json() as { status: string };
  assert.equal(data.status, "ok");
});

test("POST /api/ideas-stream: rejects invalid body with 400 and consistent error shape", async () => {
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intake: { name: "" } }),
  });
  assert.equal(res.status, 400);
  const data = await res.json() as { error: string; code: string };
  assert.equal(data.code, "VALIDATION_ERROR");
  assert.ok(data.error);
});

test("POST /api/ideas-stream: streams SSE chunks successfully", async () => {
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intake: sampleValidIntake }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/event-stream");
  const text = await res.text();
  assert.ok(text.includes("event: meta"));
  assert.ok(text.includes("event: chunk"));
  assert.ok(text.includes("event: done"));
});

test("POST /api/vendor-guidance: returns structured guidance with questions and red flags", async () => {
  const res = await fetch(`${baseUrl}/api/vendor-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "venue", eventType: "wedding" }),
  });
  assert.equal(res.status, 200);
  const data = await res.json() as { category: string; questions: string[]; source: string };
  assert.equal(data.category, "venue");
  assert.ok(data.questions.length > 0);
  assert.equal(data.source, "ai");
});

test("POST /api/assistant-stream: falls back gracefully when AI is unconfigured", async () => {
  const fallbackApp = createApp({ aiClient: unconfiguredAiClient });
  const localServer: Server = await new Promise((resolve) => {
    const s = fallbackApp.listen(0, () => resolve(s));
  });
  const port = (localServer.address() as { port: number }).port;

  const plan = {
    intake: sampleValidIntake,
    budget: [],
    timeline: [],
    vendors: [],
    warnings: { compressedTimeline: false, leadDays: 100, overBudgetCount: 0, overdueTaskCount: 0 },
  };

  const res = await fetch(`http://127.0.0.1:${port}/api/assistant-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, message: "What am I forgetting?" }),
  });

  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('"source":"fallback"'));
  assert.ok(text.includes("event: done"));

  await new Promise<void>((resolve) => localServer.close(() => resolve()));
});

test("POST /api/vendor-guidance: rate limit bucket exhausts after repeated calls", async () => {
  const responses = [];
  for (let i = 0; i < 18; i++) {
    const r = await fetch(`${baseUrl}/api/vendor-guidance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "catering_bar", eventType: "wedding" }),
    });
    responses.push(r.status);
  }
  assert.ok(responses.includes(429), "Should return 429 when rate limit exhausted");
});
