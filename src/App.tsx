import React, { lazy, Suspense, useEffect, useState } from "react";
import { BudgetPlanner } from "./components/budget/BudgetPlanner.js";
import { Footer } from "./components/layout/Footer.js";
import { Header } from "./components/layout/Header.js";
import { Navigation, type ActiveSection } from "./components/layout/Navigation.js";
import { TimelinePlanner } from "./components/timeline/TimelinePlanner.js";
import { VendorChecklist } from "./components/vendors/VendorChecklist.js";
import { IntakeWizard } from "./components/wizard/IntakeWizard.js";
import { PlanProvider, usePlanState } from "./state/PlanContext.js";

const LazyPersonalizedIdeas = lazy(() => import("./components/ai/PersonalizedIdeas.js"));
const LazyPlanningAssistant = lazy(() => import("./components/ai/PlanningAssistant.js"));
const LazyPlanSummary = lazy(() => import("./components/ai/PlanSummary.js"));

const SECTION_TITLES: Record<ActiveSection, string> = {
  intake: "Intake & Setup — EventCraft",
  budget: "Budget Planner — EventCraft",
  timeline: "Timeline & Milestones — EventCraft",
  vendors: "Vendor Checklist — EventCraft",
  ideas: "Personalized Celebration Ideas — EventCraft",
  assistant: "Planning Assistant — EventCraft",
  summary: "Executive Plan Summary — EventCraft",
};

function MainSection({
  section,
  onPlanCreated,
}: {
  section: ActiveSection;
  onPlanCreated: () => void;
}): React.JSX.Element {
  if (section === "intake") return <IntakeWizard onPlanCreated={onPlanCreated} />;
  if (section === "budget") return <BudgetPlanner />;
  if (section === "timeline") return <TimelinePlanner />;
  if (section === "vendors") return <VendorChecklist />;

  if (section === "ideas") {
    return (
      <Suspense fallback={<div className="p-12 text-center text-slate-600">Loading personalized ideas...</div>}>
        <LazyPersonalizedIdeas />
      </Suspense>
    );
  }
  if (section === "assistant") {
    return (
      <Suspense fallback={<div className="p-12 text-center text-slate-600">Loading planning assistant...</div>}>
        <LazyPlanningAssistant />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-600">Loading executive summary...</div>}>
      <LazyPlanSummary />
    </Suspense>
  );
}

function AppContent(): React.JSX.Element {
  const { plan } = usePlanState();
  const [section, setSection] = useState<ActiveSection>(plan ? "budget" : "intake");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const activeSection: ActiveSection = plan ? section : "intake";

  useEffect(() => {
    document.title = SECTION_TITLES[activeSection];
    const sectionH2 = document.querySelector<HTMLHeadingElement>("main h2");
    if (sectionH2) {
      sectionH2.focus();
    }
  }, [activeSection]);

  const handlePlanCreated = (): void => {
    setStatusMessage("Event plan successfully generated and saved.");
    setSection("budget");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      <Header />
      <Navigation
        currentSection={activeSection}
        onSelectSection={(s) => {
          setStatusMessage(`Navigated to ${SECTION_TITLES[s].split(" — ")[0]}`);
          setSection(s);
        }}
        hasPlan={Boolean(plan)}
      />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <MainSection section={activeSection} onPlanCreated={handlePlanCreated} />
      </main>

      <Footer />
    </div>
  );
}

export interface AppProps {
  initialStateOverride?: import("./state/planReducer.js").PlanState;
}

export default function App({ initialStateOverride }: AppProps = {}): React.JSX.Element {
  return (
    <PlanProvider initialStateOverride={initialStateOverride}>
      <AppContent />
    </PlanProvider>
  );
}
