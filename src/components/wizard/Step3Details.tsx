import React from "react";

interface Step3DetailsProps {
  themeNotes: string;
  setThemeNotes: (t: string) => void;
  guestNeeds: string;
  setGuestNeeds: (g: string) => void;
  culturalTraditions: string;
  setCulturalTraditions: (c: string) => void;
  isExistingPlan: boolean;
  onBack: () => void;
}

function Step3Inputs({
  themeNotes,
  setThemeNotes,
  guestNeeds,
  setGuestNeeds,
  culturalTraditions,
  setCulturalTraditions,
}: Omit<Step3DetailsProps, "isExistingPlan" | "onBack">): React.JSX.Element {
  return (
    <>
      <div>
        <label htmlFor="themeNotes" className="block text-sm font-semibold text-slate-900 mb-1">
          Style, Theme & Atmosphere Notes
        </label>
        <textarea
          id="themeNotes"
          rows={3}
          value={themeNotes}
          onChange={(e) => setThemeNotes(e.target.value)}
          placeholder="e.g. Modern botanical, warm candlelit lighting"
          className="w-full px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="guestNeeds" className="block text-sm font-semibold text-slate-900 mb-1">
          Guest Dietary & Accessibility Needs
        </label>
        <textarea
          id="guestNeeds"
          rows={2}
          value={guestNeeds}
          onChange={(e) => setGuestNeeds(e.target.value)}
          placeholder="e.g. Wheelchair ramp needed, vegan options"
          className="w-full px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="culturalTraditions" className="block text-sm font-semibold text-slate-900 mb-1">
          Optional Cultural Traditions or Ceremonies
        </label>
        <textarea
          id="culturalTraditions"
          rows={2}
          value={culturalTraditions}
          onChange={(e) => setCulturalTraditions(e.target.value)}
          placeholder="e.g. Tea ceremony, milestone speeches"
          className="w-full px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
    </>
  );
}

export function Step3Details({
  themeNotes,
  setThemeNotes,
  guestNeeds,
  setGuestNeeds,
  culturalTraditions,
  setCulturalTraditions,
  isExistingPlan,
  onBack,
}: Step3DetailsProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Step3Inputs
        themeNotes={themeNotes}
        setThemeNotes={setThemeNotes}
        guestNeeds={guestNeeds}
        setGuestNeeds={setGuestNeeds}
        culturalTraditions={culturalTraditions}
        setCulturalTraditions={setCulturalTraditions}
      />
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="min-h-[44px] px-8 py-2 bg-teal-700 text-white font-bold rounded hover:bg-teal-800 shadow"
        >
          {isExistingPlan ? "Update Event Plan" : "Generate Event Plan"}
        </button>
      </div>
    </div>
  );
}
