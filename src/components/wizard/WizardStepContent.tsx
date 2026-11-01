import React from "react";
import type { Currency, EventType } from "../../../shared/types.js";
import { Step1Basics } from "./Step1Basics.js";
import { Step2Budget } from "./Step2Budget.js";
import { Step3Details } from "./Step3Details.js";

export interface WizardFormState {
  eventType: EventType;
  name: string;
  date: string;
  guestCount: number;
  budgetMajor: number;
  currency: Currency;
  city: string;
  priorities: string[];
  themeNotes: string;
  guestNeeds: string;
  culturalTraditions: string;
}

export interface WizardSetters {
  setField: <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => void;
  onTogglePriority: (id: string) => void;
}

export function WizardStepContent({
  step,
  form,
  isExistingPlan,
  onStepChange,
  setters,
}: {
  step: number;
  form: WizardFormState;
  isExistingPlan: boolean;
  onStepChange: (s: number) => void;
  setters: WizardSetters;
}): React.JSX.Element {
  if (step === 1) {
    return (
      <Step1Basics
        eventType={form.eventType}
        setEventType={(t) => { setters.setField("eventType", t); setters.setField("priorities", []); }}
        name={form.name}
        setName={(n) => setters.setField("name", n)}
        date={form.date}
        setDate={(d) => setters.setField("date", d)}
        city={form.city}
        setCity={(c) => setters.setField("city", c)}
        onNext={() => onStepChange(2)}
      />
    );
  }
  if (step === 2) {
    return (
      <Step2Budget
        eventType={form.eventType}
        guestCount={form.guestCount}
        setGuestCount={(g) => setters.setField("guestCount", g)}
        currency={form.currency}
        setCurrency={(c) => setters.setField("currency", c)}
        budgetMajor={form.budgetMajor}
        setBudgetMajor={(b) => setters.setField("budgetMajor", b)}
        priorities={form.priorities}
        onTogglePriority={setters.onTogglePriority}
        onBack={() => onStepChange(1)}
        onNext={() => onStepChange(3)}
      />
    );
  }
  return (
    <Step3Details
      themeNotes={form.themeNotes}
      setThemeNotes={(t) => setters.setField("themeNotes", t)}
      guestNeeds={form.guestNeeds}
      setGuestNeeds={(g) => setters.setField("guestNeeds", g)}
      culturalTraditions={form.culturalTraditions}
      setCulturalTraditions={(c) => setters.setField("culturalTraditions", c)}
      isExistingPlan={isExistingPlan}
      onBack={() => onStepChange(2)}
    />
  );
}
