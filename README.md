# EventCraft — Celebration & Event Planner

EventCraft is a GenAI-powered planning assistant designed to help organizers seamlessly plan weddings, birthdays, and community events with tailored budgets, backward-scheduled timelines, vendor checklists, and personalized celebration ideas. By combining deterministic domain modeling with server-side generative AI, EventCraft delivers immediate structure, dependable tracking, and creative enrichment for celebrations of any scale.

## The Plan Engine

At the core of EventCraft is the Plan Engine—a deterministic, pure, and fully tested pipeline (`intake → plan (budget + timeline + vendor checklist) → tracking`). When users edit event parameters (such as target date, guest count, total budget, or priority categories), the Plan Engine re-plans allocations and milestones while preserving existing user progress (actual spend, completed tasks, and vendor notes) via stable identifiers. Actual spend feeds budget health warnings, and target dates feed backward-scheduled milestones and overdue detection. Generative AI enriches the plan with creative suggestions, vendor interview guidance, and contextual advice, but is never required for application correctness.

## Core Features (7 Brief Capabilities)

| # | Brief Element | Application Feature | Primary Implementation File |
|---|---|---|---|
| 1 | Event Intake & Parameters | **Intake Wizard** — Multi-step accessible form capturing event type, date, guests, budget, currency, priorities, theme, dietary/accessibility needs, and cultural traditions. | `src/components/wizard/IntakeWizard.tsx` |
| 2 | Budget Allocation & Tracking | **Budget Planner** — Category allocation from per-type templates adjusted by priority weighting, editable actual spend, and over-budget warnings. | `src/components/budget/BudgetPlanner.tsx` |
| 3 | Milestone Scheduling | **Timeline Planner** — Backward-scheduled milestones with automatic schedule compression and overdue detection. | `src/components/timeline/TimelinePlanner.tsx` |
| 4 | Vendor Coordination | **Vendor Checklist** — Per-category procurement tracks with status transitions, quote recording, notes, and AI questions/red-flags guidance. | `src/components/vendors/VendorChecklist.tsx` |
| 5 | Creative Enrichment | **Personalized Ideas** — Streamed suggestions for themes, decor, curated menus, activities, favors, and entertainment tailored to intake. | `src/components/ai/PersonalizedIdeas.tsx` |
| 6 | Plan Guidance | **Planning Assistant** — Grounded interactive assistant answering contextual questions with quick-prompt shortcuts. | `src/components/ai/PlanningAssistant.tsx` |
| 7 | Stakeholder Briefing | **Plan Summary** — Streamed executive plan audit with a clean print stylesheet for offline PDF export. | `src/components/ai/PlanSummary.tsx` |

## Important Cost & Guidance Disclosure

All cost figures, allocations, and timeline milestones displayed in EventCraft are planning guidelines and estimates, not binding quotes or legal commitments. Actual vendor contracts, local permits, and market conditions vary. When Gemini AI is unreachable or unconfigured, EventCraft gracefully falls back to structured domain templates clearly badged as "Template-based (AI unavailable)".

## Getting Started

### Development
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Running Test Coverage
```bash
npm run test:coverage
```

### Linting & Type Checking
```bash
npm run lint
```

### Production Build & Launch
```bash
npm run build
npm start
```
