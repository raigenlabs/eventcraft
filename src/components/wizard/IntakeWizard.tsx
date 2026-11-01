import React, { useRef, useState } from "react";
import { MAX_PRIORITIES } from "../../../shared/constants.js";
import { createPlan, replan } from "../../../shared/planEngine.js";
import type { EventPlan, IntakeForm } from "../../../shared/types.js";
import { validateIntake } from "../../../shared/validation.js";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.js";
import { WizardStepContent, type WizardFormState } from "./WizardStepContent.js";

const DEFAULT_FORM: WizardFormState = {
  eventType: "wedding",
  name: "",
  date: "",
  guestCount: 100,
  budgetMajor: 25000,
  currency: "USD",
  city: "",
  priorities: [],
  themeNotes: "",
  guestNeeds: "",
  culturalTraditions: "",
};

function getInitialFormState(plan: EventPlan | null): WizardFormState {
  if (!plan) return DEFAULT_FORM;
  const { intake } = plan;
  return {
    ...DEFAULT_FORM,
    ...intake,
    budgetMajor: intake.totalBudgetCents / 100,
  };
}

export function IntakeWizard({ onPlanCreated }: { onPlanCreated: () => void }): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const errorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState<WizardFormState>(() => getInitialFormState(plan));

  const setField = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTogglePriority = (id: string): void => {
    const list = form.priorities;
    if (list.includes(id)) setField("priorities", list.filter((p) => p !== id));
    else if (list.length < MAX_PRIORITIES) setField("priorities", [...list, id]);
  };

  const handleStep = (s: number): void => {
    setErrors([]); setStep(s); setTimeout(() => headingRef.current?.focus(), 50);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrors([]);
    const c: IntakeForm = { ...form, totalBudgetCents: Math.round(form.budgetMajor * 100) };
    const val = validateIntake(c);
    if (!val.ok) { setErrors([val.error]); setTimeout(() => errorRef.current?.focus(), 50); return; }
    const today = new Date().toISOString().slice(0, 10);
    const res = plan ? replan(plan, val.value, today) : createPlan(val.value, today);
    if (res.ok) { dispatch({ type: "SET_PLAN", payload: res.value }); onPlanCreated(); }
    else { setErrors([res.error]); setTimeout(() => errorRef.current?.focus(), 50); }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg p-6 max-w-3xl mx-auto shadow-sm">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          {plan ? "Update Event Parameters" : "Create Your Event Plan"}
        </h2>
        <div className="flex items-center gap-4 mt-3" aria-label="Wizard Steps">
          {[1, 2, 3].map((s) => (
            <button key={s} type="button" onClick={() => handleStep(s)} aria-current={step === s ? "step" : undefined}
              className={`min-h-[44px] min-w-[44px] px-3 py-1 rounded text-sm font-semibold transition-colors ${step === s ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              Step {s}
            </button>
          ))}
        </div>
      </div>
      {errors.length > 0 && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 p-4 bg-red-50 border border-red-300 rounded text-red-900 focus:outline-none">
          <h3 className="font-bold text-sm">Please correct the following:</h3>
          <ul className="list-disc pl-5 mt-1 text-sm">{errors.map((err, i) => (<li key={i}>{err}</li>))}</ul>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <WizardStepContent step={step} form={form} isExistingPlan={Boolean(plan)} onStepChange={handleStep} setters={{ setField, onTogglePriority: handleTogglePriority }} />
      </form>
    </div>
  );
}
