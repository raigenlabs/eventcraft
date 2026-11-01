import { type Request, type Response, Router } from "express";
import type { EventPlan } from "../../shared/types.js";
import { validateIntake } from "../../shared/validation.js";
import { getSummaryFallback } from "../ai/fallbacks.js";
import type { AiClient } from "../ai/geminiClient.js";
import { buildSummaryPrompt } from "../ai/prompts.js";
import { streamToClient } from "../ai/stream.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

/**
 * Creates executive summary streaming router.
 */
export function createSummaryRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/summary-stream", rateLimitMiddleware, async (req: Request, res: Response) => {
    const plan = (req.body as Record<string, unknown>)?.plan as EventPlan;

    if (!plan || typeof plan !== "object" || !validateIntake(plan.intake).ok) {
      res.status(400).json({ error: "A valid event plan is required.", code: "VALIDATION_ERROR" });
      return;
    }

    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    if (!aiClient.isConfigured()) {
      const fallback = getSummaryFallback(plan);
      await streamToClient(res, "fallback", fallback, controller.signal);
      return;
    }

    try {
      const prompt = buildSummaryPrompt(plan);
      const stream = aiClient.streamText(prompt, controller.signal);
      await streamToClient(res, "ai", stream, controller.signal);
    } catch {
      const fallback = getSummaryFallback(plan);
      await streamToClient(res, "fallback", fallback, controller.signal);
    }
  });

  return router;
}
