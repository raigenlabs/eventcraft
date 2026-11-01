import React from "react";

export type ActiveSection =
  | "intake"
  | "budget"
  | "timeline"
  | "vendors"
  | "ideas"
  | "assistant"
  | "summary";

export interface NavigationProps {
  currentSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  hasPlan: boolean;
}

interface NavItem {
  id: ActiveSection;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "intake", label: "Intake & Setup" },
  { id: "budget", label: "Budget Planner" },
  { id: "timeline", label: "Timeline" },
  { id: "vendors", label: "Vendors" },
  { id: "ideas", label: "Personalized Ideas" },
  { id: "assistant", label: "AI Assistant" },
  { id: "summary", label: "Plan Summary" },
] as const;

function getNavButtonClass(isCurrent: boolean, isDisabled: boolean): string {
  if (isCurrent) {
    return "bg-teal-700 text-white shadow-sm";
  }
  if (isDisabled) {
    return "text-slate-400 cursor-not-allowed opacity-60";
  }
  return "text-slate-700 hover:text-slate-900 hover:bg-slate-200";
}

export function Navigation({
  currentSection,
  onSelectSection,
  hasPlan,
}: NavigationProps): React.JSX.Element {
  return (
    <nav aria-label="Plan sections" className="bg-slate-100 border-b border-slate-300 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {NAV_ITEMS.map((item) => {
          const isCurrent = currentSection === item.id;
          const isDisabled = !hasPlan && item.id !== "intake";

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => onSelectSection(item.id)}
              className={`min-h-[44px] px-3.5 py-2 text-sm font-semibold rounded whitespace-nowrap transition-colors ${getNavButtonClass(
                isCurrent,
                isDisabled,
              )}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
