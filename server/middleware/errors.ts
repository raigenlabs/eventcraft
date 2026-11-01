import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Express centralized error handler returning uniform error shape without leaking internal stack traces.
 */
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Handle express json parsing error or syntax error in body
  if (err && typeof err === "object" && "type" in err && err.type === "entity.too.large") {
    res.status(413).json({
      error: "Payload too large. Maximum request size is 20KB.",
      code: "PAYLOAD_TOO_LARGE",
    });
    return;
  }

  res.status(500).json({
    error: "An unexpected server error occurred.",
    code: "INTERNAL_SERVER_ERROR",
  });
}
