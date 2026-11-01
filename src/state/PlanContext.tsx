import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { STORAGE_DEBOUNCE_MS } from "../../shared/constants.js";
import {
  initialPlanState,
  planReducer,
  type PlanAction,
  type PlanState,
} from "./planReducer.js";
import { loadStoredPlan, saveStoredPlan } from "./storage.js";

const PlanStateContext = createContext<PlanState | null>(null);
const PlanDispatchContext = createContext<React.Dispatch<PlanAction> | null>(null);

export interface PlanProviderProps {
  children: ReactNode;
  initialStateOverride?: PlanState;
}

/**
 * Provider component supplying dual contexts for state and dispatch to optimize re-rendering.
 */
export function PlanProvider({
  children,
  initialStateOverride,
}: PlanProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(
    planReducer,
    initialStateOverride ?? initialPlanState,
    (init) => {
      if (initialStateOverride) return initialStateOverride;
      const stored = loadStoredPlan();
      return stored ? { plan: stored, lastSavedAt: Date.now() } : init;
    },
  );

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.plan) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (state.plan) saveStoredPlan(state.plan);
      }, STORAGE_DEBOUNCE_MS);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.plan]);

  return (
    <PlanStateContext.Provider value={state}>
      <PlanDispatchContext.Provider value={dispatch}>
        {children}
      </PlanDispatchContext.Provider>
    </PlanStateContext.Provider>
  );
}

/**
 * Hook to read the current event plan state.
 */
export function usePlanState(): PlanState {
  const ctx = useContext(PlanStateContext);
  if (!ctx) throw new Error("usePlanState must be used within PlanProvider");
  return ctx;
}

/**
 * Hook to access the event plan dispatch function without triggering state re-renders.
 */
export function usePlanDispatch(): React.Dispatch<PlanAction> {
  const ctx = useContext(PlanDispatchContext);
  if (!ctx) throw new Error("usePlanDispatch must be used within PlanProvider");
  return ctx;
}
