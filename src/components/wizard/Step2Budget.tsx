import React from "react";
import { CURRENCIES, MAX_PRIORITIES } from "../../../shared/constants.js";
import { getBudgetTemplate } from "../../../shared/data/budgetTemplates.js";
import type { Currency, EventType } from "../../../shared/types.js";

interface Step2BudgetProps {
  eventType: EventType;
  guestCount: number;
  setGuestCount: (g: number) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  budgetMajor: number;
  setBudgetMajor: (b: number) => void;
  priorities: string[];
  onTogglePriority: (catId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

function getPriorityLabelClass(isChecked: boolean, isMaxed: boolean): string {
  if (isChecked) return "bg-teal-50 border-teal-700";
  if (isMaxed) return "opacity-50 cursor-not-allowed border-slate-200";
  return "border-slate-300 hover:bg-slate-50";
}

function PriorityCategoryCheckboxes({
  eventType,
  priorities,
  onToggle,
}: {
  eventType: EventType;
  priorities: string[];
  onToggle: (id: string) => void;
}): React.JSX.Element {
  const categories = getBudgetTemplate(eventType).filter((c) => !c.isContingency);

  return (
    <fieldset className="border border-slate-300 p-4 rounded">
      <legend className="font-semibold text-sm text-slate-900 px-1">
        Priority Categories (Select up to {MAX_PRIORITIES})
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {categories.map((cat) => {
          const isChecked = priorities.includes(cat.id);
          const isMaxed = priorities.length >= MAX_PRIORITIES && !isChecked;
          return (
            <label
              key={cat.id}
              className={`min-h-[44px] flex items-center gap-3 p-2.5 border rounded cursor-pointer ${getPriorityLabelClass(
                isChecked,
                isMaxed,
              )}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isMaxed}
                onChange={() => onToggle(cat.id)}
                className="w-4 h-4 text-teal-700 rounded"
              />
              <span className="text-sm font-medium text-slate-900">{cat.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function GuestAndCurrencyFields({
  guestCount,
  setGuestCount,
  currency,
  setCurrency,
}: {
  guestCount: number;
  setGuestCount: (g: number) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="guestCount" className="block text-sm font-semibold text-slate-900 mb-1">Expected Guest Count</label>
        <input
          id="guestCount"
          type="number"
          min="1"
          max="5000"
          required
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value || "1", 10))}
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="currency" className="block text-sm font-semibold text-slate-900 mb-1">Currency</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        >
          {CURRENCIES.map((curr) => (<option key={curr} value={curr}>{curr}</option>))}
        </select>
      </div>
    </div>
  );
}

export function Step2Budget({
  eventType,
  guestCount,
  setGuestCount,
  currency,
  setCurrency,
  budgetMajor,
  setBudgetMajor,
  priorities,
  onTogglePriority,
  onBack,
  onNext,
}: Step2BudgetProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <GuestAndCurrencyFields guestCount={guestCount} setGuestCount={setGuestCount} currency={currency} setCurrency={setCurrency} />
      <div>
        <label htmlFor="budgetMajor" className="block text-sm font-semibold text-slate-900 mb-1">
          Total Planned Budget ({currency})
        </label>
        <input
          id="budgetMajor"
          type="number"
          min="0"
          step="100"
          required
          value={budgetMajor}
          onChange={(e) => setBudgetMajor(parseFloat(e.target.value || "0"))}
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
        <p className="text-xs text-slate-600 mt-1">Figures are starting allocations. Actual spending is tracked dynamically.</p>
      </div>

      <PriorityCategoryCheckboxes eventType={eventType} priorities={priorities} onToggle={onTogglePriority} />

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50">Back</button>
        <button type="button" onClick={onNext} className="min-h-[44px] px-6 py-2 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800">Continue to Style & Notes</button>
      </div>
    </div>
  );
}
