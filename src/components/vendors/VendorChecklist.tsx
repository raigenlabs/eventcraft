import React, { memo, useCallback, useId, useState } from "react";
import { VENDOR_STATUSES } from "../../../shared/constants.js";
import type { Currency, VendorGuidanceResponse, VendorItem, VendorStatus } from "../../../shared/types.js";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.js";
import { SparklesIcon } from "../layout/Icons.js";

function VendorRowInputs({
  item,
  currency,
  onUpdate,
}: {
  item: VendorItem;
  currency: Currency;
  onUpdate: (id: string, patch: Partial<VendorItem>) => void;
}): React.JSX.Element {
  const statusId = useId();
  const quoteId = useId();
  const notesId = useId();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label htmlFor={statusId} className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
        <select
          id={statusId}
          value={item.status}
          onChange={(e) => onUpdate(item.id, { status: e.target.value as VendorStatus })}
          className="w-full min-h-[44px] px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 font-medium capitalize focus:border-teal-700"
        >
          {VENDOR_STATUSES.map((st) => (
            <option key={st} value={st}>{st.replace("-", " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={quoteId} className="block text-xs font-semibold text-slate-700 mb-1">Quote ({currency})</label>
        <input
          id={quoteId}
          type="number"
          min="0"
          step="10"
          value={item.quoteCents ? item.quoteCents / 100 : ""}
          onChange={(e) => onUpdate(item.id, { quoteCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
          placeholder="0"
          className="w-full min-h-[44px] px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:border-teal-700"
        />
      </div>
      <div>
        <label htmlFor={notesId} className="block text-xs font-semibold text-slate-700 mb-1">Notes & Terms</label>
        <input
          id={notesId}
          type="text"
          value={item.notes}
          onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
          placeholder="e.g. Deposit paid, contract signed"
          className="w-full min-h-[44px] px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:border-teal-700"
        />
      </div>
    </div>
  );
}

const VendorRow = memo(function VendorRow({
  item,
  currency,
  onUpdate,
  onViewGuidance,
}: {
  item: VendorItem;
  currency: Currency;
  onUpdate: (id: string, patch: Partial<VendorItem>) => void;
  onViewGuidance: (category: string) => void;
}): React.JSX.Element {
  return (
    <div className="p-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-slate-900">{item.title}</h3>
          <span className="text-xs text-slate-600 capitalize">Category: {item.category.replace(/_/g, " ")}</span>
        </div>
        <button
          type="button"
          onClick={() => onViewGuidance(item.category)}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors self-start sm:self-auto"
        >
          <SparklesIcon size={14} />
          <span>Questions & Red Flags</span>
        </button>
      </div>
      <VendorRowInputs item={item} currency={currency} onUpdate={onUpdate} />
    </div>
  );
});

function GuidanceCard({
  guidance,
  onDismiss,
}: {
  guidance: VendorGuidanceResponse;
  onDismiss: () => void;
}): React.JSX.Element {
  return (
    <div className="p-5 bg-teal-50 border border-teal-300 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-teal-950 capitalize">Guidance for {guidance.category.replace(/_/g, " ")}</h3>
        <span className="text-xs font-bold px-2 py-1 rounded bg-teal-200 text-teal-900">
          {guidance.source === "ai" ? "AI-generated" : "Template-based (AI unavailable)"}
        </span>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase text-teal-900 tracking-wide mb-1">Key Questions to Ask:</h4>
        <ul className="list-disc pl-5 text-sm text-teal-950 space-y-1">
          {guidance.questions.map((q, i) => (<li key={i}>{q}</li>))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase text-red-900 tracking-wide mb-1">Red Flags to Watch For:</h4>
        <ul className="list-disc pl-5 text-sm text-red-950 space-y-1">
          {guidance.redFlags.map((r, i) => (<li key={i}>{r}</li>))}
        </ul>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="min-h-[44px] px-3 py-1 text-xs font-semibold text-teal-900 border border-teal-400 rounded hover:bg-teal-100"
      >
        Dismiss Guidance
      </button>
    </div>
  );
}

export function VendorChecklist(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [activeGuidance, setActiveGuidance] = useState<VendorGuidanceResponse | null>(null);

  const handleUpdate = useCallback((vendorId: string, patch: Partial<VendorItem>) => {
    dispatch({ type: "UPDATE_VENDOR", payload: { vendorId, patch } });
  }, [dispatch]);

  const handleFetchGuidance = useCallback(async (category: string) => {
    if (!plan) return;
    try {
      const res = await fetch("/api/vendor-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, eventType: plan.intake.eventType }),
      });
      if (res.ok) setActiveGuidance(await res.json());
    } catch {
      // Ignored
    }
  }, [plan]);

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to view vendors.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">Vendor Checklist</h2>
        <p className="text-sm text-slate-700 mt-1">Track hiring status, vendor quotes, and key interview questions.</p>
      </div>
      {activeGuidance && <GuidanceCard guidance={activeGuidance} onDismiss={() => setActiveGuidance(null)} />}
      <div className="bg-white border border-slate-300 rounded-lg divide-y divide-slate-200 shadow-sm">
        {plan.vendors.map((item) => (
          <VendorRow
            key={item.id}
            item={item}
            currency={plan.intake.currency}
            onUpdate={handleUpdate}
            onViewGuidance={handleFetchGuidance}
          />
        ))}
      </div>
    </div>
  );
}
