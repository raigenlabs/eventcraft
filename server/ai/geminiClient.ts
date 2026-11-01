import { GoogleGenAI } from "@google/genai";

export interface AiClient {
  isConfigured: () => boolean;
  generateText: (prompt: string, signal?: AbortSignal) => Promise<string>;
  streamText: (prompt: string, signal?: AbortSignal) => AsyncIterable<string>;
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || undefined;
}

/**
 * Default production Gemini AI client implementation using the official Google Gen AI SDK.
 */
export const defaultClient: AiClient = {
  isConfigured(): boolean {
    const key = getApiKey();
    return Boolean(key && key !== "MY_GEMINI_API_KEY");
  },

  async generateText(prompt: string): Promise<string> {
    const key = getApiKey();
    if (!key) {
      throw new Error("Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return response.text ?? "";
  },

  async *streamText(prompt: string, signal?: AbortSignal): AsyncIterable<string> {
    const key = getApiKey();
    if (!key) {
      throw new Error("Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (signal?.aborted) break;
      if (chunk.text) {
        yield chunk.text;
      }
    }
  },
};
