import { type Request, type Response, Router } from "express";
import { sanitizeStr } from "../../shared/sanitize.js";
import type { EventPlan } from "../../shared/types.js";
import { validateIntake } from "../../shared/validation.js";
import { getAssistantFallback } from "../ai/fallbacks.js";
import type { AiClient } from "../ai/geminiClient.js";
import { buildAssistantPrompt } from "../ai/prompts.js";
import { streamToClient } from "../ai/stream.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

/**
 * Creates assistant streaming router grounded in event plan state.
 */
export function createAssistantRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/assistant-stream", rateLimitMiddleware, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const plan = body?.plan as EventPlan;
    const rawMessage = body?.message;

    const message = sanitizeStr(rawMessage, 500);
    if (!message) {
      res.status(400).json({ error: "Message must be a non-empty string.", code: "VALIDATION_ERROR" });
      return;
    }

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
      const fallback = getAssistantFallback(plan, message);
      await streamToClient(res, "fallback", fallback, controller.signal);
      return;
    }

    try {
      const prompt = buildAssistantPrompt(plan, message);
      const stream = aiClient.streamText(prompt, controller.signal);
      await streamToClient(res, "ai", stream, controller.signal);
    } catch {
      const fallback = getAssistantFallback(plan, message);
      await streamToClient(res, "fallback", fallback, controller.signal);
    }
  });

  return router;
}
