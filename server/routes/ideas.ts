import { type Request, type Response, Router } from "express";
import { validateIntake } from "../../shared/validation.js";
import { getIdeasFallback } from "../ai/fallbacks.js";
import type { AiClient } from "../ai/geminiClient.js";
import { buildIdeasPrompt } from "../ai/prompts.js";
import { streamToClient } from "../ai/stream.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

/**
 * Creates ideas streaming router with intake validation and fallback handling.
 */
export function createIdeasRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/ideas-stream", rateLimitMiddleware, async (req: Request, res: Response) => {
    const rawIntake = (req.body as Record<string, unknown>)?.intake;
    const intakeRes = validateIntake(rawIntake);

    if (!intakeRes.ok) {
      res.status(400).json({ error: intakeRes.error, code: "VALIDATION_ERROR" });
      return;
    }

    const intake = intakeRes.value;
    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    if (!aiClient.isConfigured()) {
      const fallbackText = getIdeasFallback(intake);
      await streamToClient(res, "fallback", fallbackText, controller.signal);
      return;
    }

    try {
      const prompt = buildIdeasPrompt(intake);
      const stream = aiClient.streamText(prompt, controller.signal);
      await streamToClient(res, "ai", stream, controller.signal);
    } catch {
      const fallbackText = getIdeasFallback(intake);
      await streamToClient(res, "fallback", fallbackText, controller.signal);
    }
  });

  return router;
}
