import { type Request, type Response, Router } from "express";

/**
 * Creates health check router for monitoring service uptime.
 */
export function createHealthRouter(): Router {
  const router = Router();
  router.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
  return router;
}
