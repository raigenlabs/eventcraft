import { replan } from "../../shared/planEngine.js";
import { isOverdue } from "../../shared/timeline.js";
import type {
  EventPlan,
  IntakeForm,
  VendorItem,
  VendorStatus,
} from "../../shared/types.js";
import { updateVendorItem } from "../../shared/vendors.js";

export type PlanAction =
  | { type: "SET_PLAN"; payload: EventPlan }
  | { type: "UPDATE_INTAKE"; payload: { patch: Partial<IntakeForm>; today: string } }
  | { type: "UPDATE_BUDGET_ACTUAL"; payload: { categoryId: string; actualCents: number; today: string } }
  | { type: "TOGGLE_TIMELINE_TASK"; payload: { taskId: string; today: string } }
  | {
      type: "UPDATE_VENDOR";
      payload: {
        vendorId: string;
        patch: { status?: VendorStatus; quoteCents?: number; notes?: string };
      };
    }
  | { type: "RESET_PLAN" };

export interface PlanState {
  plan: EventPlan | null;
  lastSavedAt: number | null;
}

export const initialPlanState: PlanState = {
  plan: null,
  lastSavedAt: null,
};

function handleBudgetActual(
  state: PlanState,
  payload: { categoryId: string; actualCents: number; today: string },
): PlanState {
  if (!state.plan) return state;
  const nextBudget = state.plan.budget.map((cat) =>
    cat.id === payload.categoryId
      ? { ...cat, actualCents: Math.max(0, payload.actualCents) }
      : cat,
  );
  const overBudgetCount = nextBudget.filter((b) => b.actualCents > b.plannedCents).length;
  return {
    ...state,
    plan: {
      ...state.plan,
      budget: nextBudget,
      warnings: { ...state.plan.warnings, overBudgetCount },
    },
    lastSavedAt: Date.now(),
  };
}

function handleToggleTask(
  state: PlanState,
  payload: { taskId: string; today: string },
): PlanState {
  if (!state.plan) return state;
  const nextTimeline = state.plan.timeline.map((task) =>
    task.id === payload.taskId ? { ...task, completed: !task.completed } : task,
  );
  const overdueTaskCount = nextTimeline.filter((t) => isOverdue(t, payload.today)).length;
  return {
    ...state,
    plan: {
      ...state.plan,
      timeline: nextTimeline,
      warnings: { ...state.plan.warnings, overdueTaskCount },
    },
    lastSavedAt: Date.now(),
  };
}

function handleUpdateVendor(
  state: PlanState,
  payload: { vendorId: string; patch: Partial<VendorItem> },
): PlanState {
  if (!state.plan) return state;
  const updateRes = updateVendorItem(state.plan.vendors, payload.vendorId, payload.patch);
  if (!updateRes.ok) return state;

  return {
    ...state,
    plan: {
      ...state.plan,
      vendors: updateRes.value,
    },
    lastSavedAt: Date.now(),
  };
}

/**
 * Pure reducer function for all EventCraft state transitions.
 */
export function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "SET_PLAN":
      return { plan: action.payload, lastSavedAt: Date.now() };

    case "UPDATE_INTAKE": {
      if (!state.plan) return state;
      const replannedRes = replan(state.plan, action.payload.patch, action.payload.today);
      if (!replannedRes.ok) return state;
      return { plan: replannedRes.value, lastSavedAt: Date.now() };
    }

    case "UPDATE_BUDGET_ACTUAL":
      return handleBudgetActual(state, action.payload);

    case "TOGGLE_TIMELINE_TASK":
      return handleToggleTask(state, action.payload);

    case "UPDATE_VENDOR":
      return handleUpdateVendor(state, action.payload);

    case "RESET_PLAN":
      return initialPlanState;

    default:
      return state;
  }
}
