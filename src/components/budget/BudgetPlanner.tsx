import React, { memo, useCallback, useId, useMemo } from "react";
import { calculateBudgetSummary, getBudgetStatus } from "../../../shared/budget.js";
import type { BudgetCategory, Currency } from "../../../shared/types.js";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.js";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from "../layout/Icons.js";

function formatCurrency(cents: number, currency: Currency): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function BudgetStatusBadge({
  cat,
  currency,
}: {
  cat: BudgetCategory;
  currency: Currency;
}): React.JSX.Element {
  const status = getBudgetStatus(cat.plannedCents, cat.actualCents);
  const diffCents = cat.actualCents - cat.plannedCents;

  if (status === "over") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded">
        <AlertCircleIcon size={14} />
        <span>Over by {formatCurrency(diffCents, currency)}</span>
      </span>
    );
  }
  if (status === "near") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
        <ClockIcon size={14} />
        <span>Near budget (≥90%)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 px-2.5 py-1 rounded">
      <CheckCircleIcon size={14} />
      <span>Under budget</span>
    </span>
  );
}

const BudgetRow = memo(function BudgetRow({
  cat,
  currency,
  onUpdateActual,
}: {
  cat: BudgetCategory;
  currency: Currency;
  onUpdateActual: (id: string, actualCents: number) => void;
}): React.JSX.Element {
  const inputId = useId();

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <span>{cat.name}</span>
          {cat.isPriority && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Priority</span>
          )}
          {cat.isContingency && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Reserve</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right font-medium text-slate-700">
        {formatCurrency(cat.plannedCents, currency)}
      </td>
      <td className="py-3 px-4 text-right">
        <label htmlFor={inputId} className="sr-only">Actual spend for {cat.name}</label>
        <div className="inline-flex items-center justify-end">
          <input
            id={inputId}
            type="number"
            min="0"
            step="10"
            value={cat.actualCents ? cat.actualCents / 100 : ""}
            onChange={(e) => onUpdateActual(cat.id, Math.round(parseFloat(e.target.value || "0") * 100))}
            placeholder="0"
            className="w-32 min-h-[44px] px-3 py-1 text-right border border-slate-300 rounded focus:border-teal-700 text-slate-900"
          />
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <BudgetStatusBadge cat={cat} currency={currency} />
      </td>
    </tr>
  );
});

function BudgetKpiCards({
  summary,
  currency,
}: {
  summary: ReturnType<typeof calculateBudgetSummary>;
  currency: Currency;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white p-4 border border-slate-300 rounded-lg">
        <span className="text-xs font-semibold text-slate-700 block uppercase">Total Planned</span>
        <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{formatCurrency(summary.totalPlannedCents, currency)}</span>
      </div>
      <div className="bg-white p-4 border border-slate-300 rounded-lg">
        <span className="text-xs font-semibold text-slate-700 block uppercase">Actual / Committed</span>
        <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{formatCurrency(summary.totalActualCents, currency)}</span>
      </div>
      <div className="bg-white p-4 border border-slate-300 rounded-lg">
        <span className="text-xs font-semibold text-slate-700 block uppercase">Remaining Budget</span>
        <span className={`text-2xl font-extrabold mt-1 block ${summary.remainingCents < 0 ? "text-red-700" : "text-green-800"}`}>
          {formatCurrency(summary.remainingCents, currency)}
        </span>
      </div>
      <div className="bg-white p-4 border border-slate-300 rounded-lg">
        <span className="text-xs font-semibold text-slate-700 block uppercase">Cost Per Guest</span>
        <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{formatCurrency(summary.perGuestCostCents, currency)}</span>
      </div>
    </div>
  );
}

function getProgressColor(percent: number): string {
  if (percent > 100) return "bg-red-700";
  if (percent >= 90) return "bg-amber-600";
  return "bg-teal-700";
}

function BudgetProgressBar({ percent }: { percent: number }): React.JSX.Element {
  return (
    <div className="bg-white p-4 border border-slate-300 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-900">Total Budget Utilization</span>
        <span className="text-sm font-bold text-slate-900">{percent}% Committed</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Total budget committed percentage"
        className="w-full bg-slate-200 h-4 rounded-full overflow-hidden"
      >
        <div
          className={`h-full transition-all duration-300 ${getProgressColor(percent)}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export function BudgetPlanner(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();

  const handleUpdateActual = useCallback((categoryId: string, actualCents: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    dispatch({ type: "UPDATE_BUDGET_ACTUAL", payload: { categoryId, actualCents, today: todayStr } });
  }, [dispatch]);

  const summary = useMemo(() => {
    if (!plan) return { totalPlannedCents: 0, totalActualCents: 0, remainingCents: 0, perGuestCostCents: 0, overBudgetCount: 0 };
    return calculateBudgetSummary(plan.budget, plan.intake.guestCount);
  }, [plan]);

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to view your budget.</div>;

  const percentUsed = summary.totalPlannedCents > 0
    ? Math.min(100, Math.round((summary.totalActualCents / summary.totalPlannedCents) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">Budget Planner</h2>
        <p className="text-sm text-slate-700 mt-1">Deterministic allocation with priority boosts. Figures are estimates and guidelines, not quotes.</p>
      </div>
      <BudgetKpiCards summary={summary} currency={plan.intake.currency} />
      <BudgetProgressBar percent={percentUsed} />
      <div className="bg-white border border-slate-300 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <caption className="sr-only">Budget Category Allocations and Actual Spend</caption>
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-semibold">
            <tr>
              <th scope="col" className="py-3 px-4">Category</th>
              <th scope="col" className="py-3 px-4 text-right">Planned Spend</th>
              <th scope="col" className="py-3 px-4 text-right">Actual Spend</th>
              <th scope="col" className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {plan.budget.map((cat) => (
              <BudgetRow key={cat.id} cat={cat} currency={plan.intake.currency} onUpdateActual={handleUpdateActual} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
