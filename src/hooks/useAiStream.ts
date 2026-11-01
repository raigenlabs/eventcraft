import { useCallback, useEffect, useRef, useState } from "react";
import type { AiSource } from "../../shared/types.js";

export interface AiStreamState {
  text: string;
  isStreaming: boolean;
  source: AiSource | null;
  error: string | null;
}

interface SseParsed {
  event: string;
  source?: AiSource;
  text?: string;
  error?: string;
}

function parseSseBlock(block: string): SseParsed | null {
  if (!block.trim()) return null;
  let event = "message";
  let dataStr = "";

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) dataStr = line.slice(5).trim();
  }

  try {
    const parsed = JSON.parse(dataStr) as { source?: AiSource; text?: string; error?: string };
    return { event, source: parsed.source, text: parsed.text, error: parsed.error };
  } catch {
    return null;
  }
}

interface StreamHandlers {
  onMeta: (s: AiSource) => void;
  onChunk: (t: string) => void;
  onError: (e: string) => void;
}

function processSseBuffer(buffer: string, handlers: StreamHandlers): string {
  const blocks = buffer.split("\n\n");
  const remainder = blocks.pop() ?? "";

  for (const block of blocks) {
    const parsed = parseSseBlock(block);
    if (!parsed) continue;
    if (parsed.event === "meta" && parsed.source) handlers.onMeta(parsed.source);
    if (parsed.event === "chunk" && parsed.text) handlers.onChunk(parsed.text);
    if (parsed.event === "error") handlers.onError(parsed.error || "Streaming error.");
  }

  return remainder;
}

async function pumpStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";
  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer = processSseBuffer(buffer + decoder.decode(value, { stream: true }), handlers);
  }
}

async function executeStreamRequest(
  endpoint: string,
  body: unknown,
  ctrl: AbortController,
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream");
  await pumpStream(reader, handlers, ctrl.signal);
}

/**
 * Custom hook managing Server-Sent Events streaming with RAF batching, abort handling, and source badging.
 */
export function useAiStream(endpoint: string): {
  state: AiStreamState;
  start: (body: unknown) => Promise<void>;
  stop: () => void;
  reset: () => void;
} {
  const [state, setState] = useState<AiStreamState>({ text: "", isStreaming: false, source: null, error: null });
  const abortRef = useRef<AbortController | null>(null);
  const textRef = useRef<string>("");
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setState((p) => ({ ...p, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({ text: "", isStreaming: false, source: null, error: null });
  }, [stop]);

  const scheduleRaf = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setState((p) => ({ ...p, text: textRef.current }));
      rafRef.current = null;
    });
  }, []);

  const start = useCallback(async (body: unknown) => {
    stop();
    textRef.current = "";
    setState({ text: "", isStreaming: true, source: null, error: null });
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const handlers: StreamHandlers = {
      onMeta: (s) => setState((p) => ({ ...p, source: s })),
      onChunk: (c) => { textRef.current += c; scheduleRaf(); },
      onError: (e) => setState((p) => ({ ...p, error: e })),
    };

    try {
      await executeStreamRequest(endpoint, body, ctrl, handlers);
      setState((p) => ({ ...p, text: textRef.current, isStreaming: false }));
    } catch (err: unknown) {
      if (!ctrl.signal.aborted) {
        setState((p) => ({ ...p, error: err instanceof Error ? err.message : "Error", isStreaming: false }));
      }
    }
  }, [endpoint, stop, scheduleRaf]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { state, start, stop, reset };
}
