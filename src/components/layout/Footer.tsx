import React from "react";

export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-white border-t border-slate-300 py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
        <p>
          Cost figures and timeline milestones are planning guidelines and estimates, not binding vendor quotes.
        </p>
        <p className="font-medium text-slate-900">
          EventCraft Plan Engine • Gemini 3.8 Flash Server AI
        </p>
      </div>
    </footer>
  );
}
