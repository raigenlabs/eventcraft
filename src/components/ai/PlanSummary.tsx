import React, { useEffect, useState } from "react";
import { useAiStream } from "../../hooks/useAiStream.js";
import { usePlanState } from "../../state/PlanContext.js";
import { SparklesIcon } from "../layout/Icons.js";

function SummaryHeader({
  isStreaming,
  onRefresh,
  onStop,
  onPrint,
}: {
  isStreaming: boolean;
  onRefresh: () => void;
  onStop: () => void;
  onPrint: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
      <div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">Executive Plan Summary</h2>
        <p className="text-sm text-slate-700 mt-1">Comprehensive audit and printable brief for stakeholders and vendors.</p>
      </div>

      <div className="flex items-center gap-3">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-[44px] px-4 py-2 bg-red-700 text-white font-semibold rounded hover:bg-red-800"
          >
            Stop Generating
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRefresh}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800"
            >
              <SparklesIcon size={16} />
              <span>Refresh Summary</span>
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="min-h-[44px] px-4 py-2 bg-white border border-slate-300 text-slate-800 font-semibold rounded hover:bg-slate-50"
            >
              Print / Save PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PlanSummary(): React.JSX.Element {
  const { plan } = usePlanState();
  const { state, start, stop } = useAiStream("/api/summary-stream");
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (plan && !hasRequested && !state.text && !state.isStreaming) {
      setHasRequested(true);
      start({ plan });
    }
  }, [plan, hasRequested, state.text, state.isStreaming, start]);

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to view your summary.</div>;

  const handlePrint = (): void => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="space-y-6">
      <SummaryHeader
        isStreaming={state.isStreaming}
        onRefresh={() => start({ plan })}
        onStop={stop}
        onPrint={handlePrint}
      />

      <div className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan Audit Report</span>
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
          <div role="alert" className="p-4 mb-4 bg-red-50 border border-red-300 rounded text-red-900 text-sm no-print">
            {state.error}
          </div>
        )}

        <div
          role="log"
          aria-live="polite"
          aria-busy={state.isStreaming}
          className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-slate-900"
        >
          {state.text || (
            <div className="flex items-center justify-center h-48 text-slate-500">
              {state.isStreaming ? "Compiling executive summary..." : "Click refresh to generate summary."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanSummary;
