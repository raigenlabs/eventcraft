import type { NextFunction, Request, Response } from "express";
import {
  RATE_LIMIT_EXPIRY_MS,
  RATE_LIMIT_MAX_TOKENS,
  RATE_LIMIT_REFILL_MS,
} from "../../shared/constants.js";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  lastAccess: number;
}

const buckets = new Map<string, TokenBucket>();

function refillBucket(bucket: TokenBucket, now: number): void {
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT_REFILL_MS) {
    const tokensToAdd = Math.floor(elapsed / RATE_LIMIT_REFILL_MS);
    bucket.tokens = Math.min(RATE_LIMIT_MAX_TOKENS, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

function cleanupStaleBuckets(now: number): void {
  for (const [ip, bucket] of buckets.entries()) {
    if (now - bucket.lastAccess > RATE_LIMIT_EXPIRY_MS) {
      buckets.delete(ip);
    }
  }
}

/**
 * Token bucket rate limiter middleware for AI routes with bounded in-memory storage and stale bucket eviction.
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const now = Date.now();
  cleanupStaleBuckets(now);

  const ip = req.ip || req.socket.remoteAddress || "unknown_client";
  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = {
      tokens: RATE_LIMIT_MAX_TOKENS,
      lastRefill: now,
      lastAccess: now,
    };
    buckets.set(ip, bucket);
  }

  bucket.lastAccess = now;
  refillBucket(bucket, now);

  if (bucket.tokens <= 0) {
    res.status(429).json({
      error: "Rate limit exceeded. Please wait a moment before requesting AI generation again.",
      code: "RATE_LIMIT_EXCEEDED",
    });
    return;
  }

  bucket.tokens--;
  next();
}
