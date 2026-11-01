import React, { useEffect, useState } from "react";
import { useAiStream } from "../../hooks/useAiStream.js";
import { usePlanState } from "../../state/PlanContext.js";
import { SparklesIcon } from "../layout/Icons.js";

function IdeasHeader({
  isStreaming,
  onGenerate,
  onStop,
}: {
  isStreaming: boolean;
  onGenerate: () => void;
  onStop: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">
          Personalized Celebration Ideas
        </h2>
        <p className="text-sm text-slate-700 mt-1">
          Tailored themes, decor, menu, activities, and entertainment.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-[44px] px-4 py-2 bg-red-700 text-white font-semibold rounded hover:bg-red-800 transition-colors"
          >
            Stop Generating
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800 transition-colors shadow-sm"
          >
            <SparklesIcon size={16} />
            <span>Regenerate Ideas</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function PersonalizedIdeas(): React.JSX.Element {
  const { plan } = usePlanState();
  const { state, start, stop } = useAiStream("/api/ideas-stream");
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (plan && !hasRequested && !state.text && !state.isStreaming) {
      setHasRequested(true);
      start({ intake: plan.intake });
    }
  }, [plan, hasRequested, state.text, state.isStreaming, start]);

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to view personalized ideas.</div>;

  return (
    <div className="space-y-6">
      <IdeasHeader isStreaming={state.isStreaming} onGenerate={() => start({ intake: plan.intake })} onStop={stop} />

      <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Recommendations</span>
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
          <div role="alert" className="p-4 mb-4 bg-red-50 border border-red-300 rounded text-red-900 text-sm">
            {state.error}
          </div>
        )}

        <div
          role="log"
          aria-live="polite"
          aria-busy={state.isStreaming}
          className="prose max-w-none text-slate-900 leading-relaxed whitespace-pre-wrap font-sans text-sm md:text-base min-h-[200px]"
        >
          {state.text || (
            <div className="flex items-center justify-center h-48 text-slate-500">
              {state.isStreaming ? "Curating personalized concepts..." : "Click regenerate to load concepts."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalizedIdeas;
