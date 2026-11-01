import { type Request, type Response, Router } from "express";
import { sanitizeStr } from "../../shared/sanitize.js";
import type { VendorGuidanceResponse } from "../../shared/types.js";
import { validateEventType } from "../../shared/validation.js";
import { getVendorGuidanceFallbackResponse } from "../ai/fallbacks.js";
import type { AiClient } from "../ai/geminiClient.js";
import { buildVendorGuidancePrompt } from "../ai/prompts.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

function parseAiGuidance(raw: string): { questions: string[]; redFlags: string[] } | null {
  try {
    const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (
      Array.isArray(parsed?.questions) &&
      Array.isArray(parsed?.redFlags) &&
      parsed.questions.length > 0 &&
      parsed.redFlags.length > 0
    ) {
      return {
        questions: parsed.questions.map((q: unknown) => sanitizeStr(q, 300)),
        redFlags: parsed.redFlags.map((r: unknown) => sanitizeStr(r, 300)),
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Creates vendor guidance endpoint router providing interview questions and red flags.
 */
export function createVendorGuidanceRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/vendor-guidance", rateLimitMiddleware, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const category = sanitizeStr(body?.category, 100);
    const eventTypeRes = validateEventType(body?.eventType);

    if (!category || !eventTypeRes.ok) {
      res.status(400).json({
        error: "Valid category and eventType are required.",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    if (!aiClient.isConfigured()) {
      res.json(getVendorGuidanceFallbackResponse(category));
      return;
    }

    try {
      const prompt = buildVendorGuidancePrompt(category, eventTypeRes.value);
      const text = await aiClient.generateText(prompt);
      const guidance = parseAiGuidance(text);

      if (guidance) {
        const response: VendorGuidanceResponse = {
          category,
          questions: guidance.questions,
          redFlags: guidance.redFlags,
          source: "ai",
        };
        res.json(response);
      } else {
        res.json(getVendorGuidanceFallbackResponse(category));
      }
    } catch {
      res.json(getVendorGuidanceFallbackResponse(category));
    }
  });

  return router;
}
