import React, { useState } from "react";
import { useAiStream, type AiStreamState } from "../../hooks/useAiStream.js";
import { usePlanState } from "../../state/PlanContext.js";
import { SparklesIcon } from "../layout/Icons.js";

const QUICK_PROMPTS = [
  "What am I forgetting?",
  "Cut 10% from the budget",
  "Plan a rain backup",
] as const;

function AssistantForm({
  isStreaming,
  onSend,
  onStop,
}: {
  isStreaming: boolean;
  onSend: (msg: string) => void;
  onStop: () => void;
}): React.JSX.Element {
  const [msg, setMsg] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend(msg);
        setMsg("");
      }}
      className="flex gap-2"
    >
      <label htmlFor="assistantInput" className="sr-only">Ask a planning question</label>
      <input
        id="assistantInput"
        type="text"
        value={msg}
        disabled={isStreaming}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask anything about your schedule, budget, or backup plans..."
        className="flex-1 min-h-[44px] px-3.5 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:border-teal-700"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="min-h-[44px] px-4 py-2 bg-red-700 text-white font-semibold rounded hover:bg-red-800"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={!msg.trim()}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800 disabled:opacity-50"
        >
          <SparklesIcon size={16} />
          <span>Ask</span>
        </button>
      )}
    </form>
  );
}

function AssistantLogViewer({
  state,
  activePrompt,
}: {
  state: AiStreamState;
  activePrompt: string;
}): React.JSX.Element {
  return (
    <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {activePrompt ? `Query: "${activePrompt}"` : "Assistant Response"}
        </span>
        {state.source && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded ${
              state.source === "ai" ? "bg-teal-100 text-teal-900" : "bg-amber-100 text-amber-900"
            }`}
          >
            {state.source === "ai" ? "AI-generated" : "Template-based (AI unavailable)"}
          </span>
        )}
      </div>

      {state.error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-300 rounded text-red-900 text-sm">
          {state.error}
        </div>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-busy={state.isStreaming}
        className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-900 leading-relaxed font-sans min-h-[160px]"
      >
        {state.text || (
          <div className="flex items-center justify-center h-32 text-slate-500">
            {state.isStreaming ? "Formulating strategic advice..." : "Select a quick prompt or enter a question above."}
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanningAssistant(): React.JSX.Element {
  const { plan } = usePlanState();
  const { state, start, stop } = useAiStream("/api/assistant-stream");
  const [activePrompt, setActivePrompt] = useState<string>("");

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to use the assistant.</div>;

  const handleSend = (text: string): void => {
    if (!text.trim() || state.isStreaming) return;
    setActivePrompt(text);
    start({ plan, message: text });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">Planning Assistant</h2>
        <p className="text-sm text-slate-700 mt-1">Grounded Q&A based on your budget, timeline, and confirmed vendors.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-700">Quick prompts:</span>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={state.isStreaming}
            onClick={() => handleSend(p)}
            className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <AssistantForm isStreaming={state.isStreaming} onSend={handleSend} onStop={stop} />
      <AssistantLogViewer state={state} activePrompt={activePrompt} />
    </div>
  );
}

export default PlanningAssistant;
