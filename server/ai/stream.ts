import type { Response } from "express";

export interface SseStreamOptions {
  res: Response;
  source: "ai" | "fallback";
  onAbort?: () => void;
}

/**
 * Initializes Server-Sent Events headers on the response.
 */
export function setupSseHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

/**
 * Sends an SSE event formatted strictly per the W3C spec.
 */
export function sendSseEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function streamStringChunks(
  res: Response,
  text: string,
  signal?: AbortSignal,
): Promise<void> {
  const chunkSize = 64;
  for (let i = 0; i < text.length; i += chunkSize) {
    if (signal?.aborted || res.writableEnded) break;
    sendSseEvent(res, "chunk", { text: text.slice(i, i + chunkSize) });
  }
}

async function streamAsyncChunks(
  res: Response,
  stream: AsyncIterable<string>,
  signal?: AbortSignal,
): Promise<void> {
  for await (const chunk of stream) {
    if (signal?.aborted || res.writableEnded) break;
    sendSseEvent(res, "chunk", { text: chunk });
  }
}

/**
 * Streams a full text payload or async iterable to an SSE connection with error handling and clean termination.
 */
export async function streamToClient(
  res: Response,
  source: "ai" | "fallback",
  streamSource: AsyncIterable<string> | string,
  signal?: AbortSignal,
): Promise<void> {
  setupSseHeaders(res);
  sendSseEvent(res, "meta", { source });

  try {
    if (typeof streamSource === "string") {
      await streamStringChunks(res, streamSource, signal);
    } else {
      await streamAsyncChunks(res, streamSource, signal);
    }
    if (!res.writableEnded) {
      sendSseEvent(res, "done", { status: "complete" });
    }
  } catch {
    if (!res.writableEnded) {
      sendSseEvent(res, "error", { error: "Streaming interrupted.", code: "STREAM_ERROR" });
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}
