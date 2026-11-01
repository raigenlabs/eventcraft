import React, { useState } from "react";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.js";
import { clearStoredPlan } from "../../state/storage.js";
import { AlertCircleIcon } from "./Icons.js";

function ResetConfirmControls({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-1.5 rounded">
      <span className="text-xs text-red-900 font-medium">Reset all progress?</span>
      <button
        type="button"
        onClick={onConfirm}
        className="min-h-[44px] px-3 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[44px] px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded"
      >
        Cancel
      </button>
    </div>
  );
}

function HeaderMeta(): React.JSX.Element | null {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [confirming, setConfirming] = useState(false);

  if (!plan) return null;

  const handleReset = (): void => {
    clearStoredPlan();
    dispatch({ type: "RESET_PLAN" });
    setConfirming(false);
  };

  const hasWarnings = plan.warnings.overBudgetCount > 0 || plan.warnings.overdueTaskCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-right text-xs bg-slate-100 border border-slate-300 px-3 py-1.5 rounded">
        <span className="font-semibold text-slate-900 block">{plan.intake.name}</span>
        <span className="text-slate-700">{plan.intake.date} • {plan.intake.guestCount} guests</span>
      </div>

      {hasWarnings && (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
          <AlertCircleIcon size={16} />
          <span>
            {plan.warnings.overBudgetCount > 0 && `${plan.warnings.overBudgetCount} Over Budget `}
            {plan.warnings.overdueTaskCount > 0 && `${plan.warnings.overdueTaskCount} Overdue`}
          </span>
        </div>
      )}

      {confirming ? (
        <ResetConfirmControls onConfirm={handleReset} onCancel={() => setConfirming(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
        >
          New Plan
        </button>
      )}
    </div>
  );
}

export function Header(): React.JSX.Element {
  return (
    <header className="bg-white border-b border-slate-300 px-4 py-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-teal-700" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">EventCraft</h1>
          </div>
          <p className="text-sm text-slate-700 mt-1">
            Celebration & Event Planner — Weddings, Birthdays, Community Events
          </p>
        </div>
        <HeaderMeta />
      </div>
    </header>
  );
}
