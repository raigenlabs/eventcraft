import express, { type Express } from "express";
import { defaultClient, type AiClient } from "./ai/geminiClient.js";
import { errorHandlerMiddleware } from "./middleware/errors.js";
import { securityHeadersMiddleware } from "./middleware/security.js";
import { createAssistantRouter } from "./routes/assistant.js";
import { createHealthRouter } from "./routes/health.js";
import { createIdeasRouter } from "./routes/ideas.js";
import { createSummaryRouter } from "./routes/summary.js";
import { createVendorGuidanceRouter } from "./routes/vendorGuidance.js";

export interface AppOptions {
  aiClient?: AiClient;
}

/**
 * Creates and configures the Express application with security, API routes, and error handling.
 */
export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const client = options.aiClient ?? defaultClient;

  app.disable("x-powered-by");
  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: "20kb" }));

  // API Route mounting
  app.use("/api", createHealthRouter());
  app.use("/api", createIdeasRouter(client));
  app.use("/api", createAssistantRouter(client));
  app.use("/api", createSummaryRouter(client));
  app.use("/api", createVendorGuidanceRouter(client));

  app.use(errorHandlerMiddleware);

  return app;
}
