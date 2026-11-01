import { CURRENCIES, EVENT_TYPES, VENDOR_STATUSES } from "./constants.js";

export type EventType = (typeof EVENT_TYPES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
export type BudgetStatus = "under" | "near" | "over";
export type AiSource = "ai" | "fallback";

export interface IntakeForm {
  eventType: EventType;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  guestCount: number;
  totalBudgetCents: number; // minor units (integer cents)
  currency: Currency;
  city: string;
  priorities: string[]; // category IDs, max 3
  themeNotes: string;
  guestNeeds: string;
  culturalTraditions: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number; // template share (integer)
  plannedCents: number;
  actualCents: number;
  isPriority: boolean;
  isContingency: boolean;
}

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  daysBefore: number;
  dueDate: string; // ISO date string YYYY-MM-DD
  essential: boolean;
  completed: boolean;
}

export interface TimelineTemplateItem {
  id: string;
  title: string;
  category: string;
  daysBefore: number;
  essential: boolean;
}

export interface VendorItem {
  id: string;
  category: string;
  title: string;
  status: VendorStatus;
  quoteCents: number; // minor units (integer cents)
  notes: string;
}

export interface PlanWarnings {
  compressedTimeline: boolean;
  leadDays: number;
  overBudgetCount: number;
  overdueTaskCount: number;
}

export interface EventPlan {
  intake: IntakeForm;
  budget: BudgetCategory[];
  timeline: TimelineTask[];
  vendors: VendorItem[];
  warnings: PlanWarnings;
}

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export interface ValidationError {
  ok: false;
  error: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export interface ApiErrorResponse {
  error: string;
  code: string;
}

export interface VendorGuidanceResponse {
  category: string;
  questions: string[];
  redFlags: string[];
  source: AiSource;
}
