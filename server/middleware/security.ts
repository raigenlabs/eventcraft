import type { NextFunction, Request, Response } from "express";

export const CSP_HEADER =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https:; frame-ancestors 'self' https://*.google.com https://*.studio.google https://*.aistudio.google https://ai.studio https://*.run.app;";

/**
 * Express middleware that enforces security headers and strict production Content Security Policy.
 */
export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Omit CSP in development mode so Vite client & HMR can operate without blocking
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Content-Security-Policy", CSP_HEADER);
  }

  next();
}
