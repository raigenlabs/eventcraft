import {
  CURRENCIES,
  EVENT_TYPES,
  MAX_BUDGET_CENTS,
  MAX_GUESTS,
  MAX_NOTES_LEN,
  MAX_PRIORITIES,
  MAX_STR_LEN,
  MIN_BUDGET_CENTS,
  MIN_GUESTS,
  VENDOR_STATUSES,
} from "./constants.js";
import { sanitizeStr } from "./sanitize.js";
import type {
  Currency,
  EventType,
  IntakeForm,
  ValidationResult,
  VendorStatus,
} from "./types.js";

function isValidCalendarDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  return (
    dateObj.getUTCFullYear() === y &&
    dateObj.getUTCMonth() === m - 1 &&
    dateObj.getUTCDate() === d
  );
}

/**
 * Validates whether a value is a valid YYYY-MM-DD date matching real calendar days.
 */
export function validateDate(dateStr: unknown): ValidationResult<string> {
  if (typeof dateStr !== "string") {
    return { ok: false, error: "Date must be a string." };
  }
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return { ok: false, error: "Date must follow YYYY-MM-DD format." };
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (!isValidCalendarDate(year, month, day)) {
    return { ok: false, error: "Date does not exist on the calendar." };
  }
  return { ok: true, value: trimmed };
}

/**
 * Validates whether a string is a supported event type.
 */
export function validateEventType(typeStr: unknown): ValidationResult<EventType> {
  if (typeof typeStr !== "string" || !EVENT_TYPES.includes(typeStr as EventType)) {
    return { ok: false, error: "Invalid event type." };
  }
  return { ok: true, value: typeStr as EventType };
}

/**
 * Validates whether a string is a supported currency.
 */
export function validateCurrency(currStr: unknown): ValidationResult<Currency> {
  if (typeof currStr !== "string" || !CURRENCIES.includes(currStr as Currency)) {
    return { ok: false, error: "Invalid currency." };
  }
  return { ok: true, value: currStr as Currency };
}

/**
 * Validates whether a string is a recognized vendor status.
 */
export function validateVendorStatus(status: unknown): ValidationResult<VendorStatus> {
  if (
    typeof status !== "string" ||
    !VENDOR_STATUSES.includes(status as VendorStatus)
  ) {
    return { ok: false, error: "Invalid vendor status." };
  }
  return { ok: true, value: status as VendorStatus };
}

interface IntakeNums {
  guests: number;
  budgetCents: number;
}

function parseGuests(rawVal: unknown): ValidationResult<number> {
  const guests = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal ?? ""), 10);
  if (!Number.isInteger(guests) || guests < MIN_GUESTS || guests > MAX_GUESTS) {
    return { ok: false, error: `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}.` };
  }
  return { ok: true, value: guests };
}

function parseBudgetCents(rawVal: unknown): ValidationResult<number> {
  const budget = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal ?? ""), 10);
  if (!Number.isInteger(budget) || budget < MIN_BUDGET_CENTS || budget > MAX_BUDGET_CENTS) {
    return { ok: false, error: "Budget must be a non-negative integer in minor units." };
  }
  return { ok: true, value: budget };
}

function parseAndValidateNums(rawObj: Record<string, unknown>): ValidationResult<IntakeNums> {
  const gRes = parseGuests(rawObj.guestCount);
  if (!gRes.ok) return gRes;
  const bRes = parseBudgetCents(rawObj.totalBudgetCents);
  if (!bRes.ok) return bRes;
  return { ok: true, value: { guests: gRes.value, budgetCents: bRes.value } };
}

function parsePriorities(raw: unknown): ValidationResult<string[]> {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Priorities must be an array." };
  }
  if (raw.length > MAX_PRIORITIES) {
    return { ok: false, error: `Maximum of ${MAX_PRIORITIES} priorities allowed.` };
  }
  const cleanList = raw
    .map((p) => sanitizeStr(p, MAX_STR_LEN))
    .filter((p) => p.length > 0);
  return { ok: true, value: cleanList };
}

interface ValidatedHeader {
  eventType: EventType;
  date: string;
  currency: Currency;
  name: string;
}

function validateIntakeHeader(obj: Record<string, unknown>): ValidationResult<ValidatedHeader> {
  const eRes = validateEventType(obj.eventType);
  if (!eRes.ok) return eRes;
  const dRes = validateDate(obj.date);
  if (!dRes.ok) return dRes;
  const cRes = validateCurrency(obj.currency);
  if (!cRes.ok) return cRes;
  const name = sanitizeStr(obj.name, MAX_STR_LEN);
  if (!name) return { ok: false, error: "Event name is required." };
  return { ok: true, value: { eventType: eRes.value, date: dRes.value, currency: cRes.value, name } };
}

/**
 * Validates and sanitizes a complete IntakeForm object.
 */
export function validateIntake(raw: unknown): ValidationResult<IntakeForm> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Intake data must be a non-null object." };
  }
  const obj = raw as Record<string, unknown>;
  const headRes = validateIntakeHeader(obj);
  if (!headRes.ok) return headRes;

  const numsRes = parseAndValidateNums(obj);
  if (!numsRes.ok) return numsRes;

  const pRes = parsePriorities(obj.priorities ?? []);
  if (!pRes.ok) return pRes;

  return {
    ok: true,
    value: {
      ...headRes.value,
      guestCount: numsRes.value.guests,
      totalBudgetCents: numsRes.value.budgetCents,
      city: sanitizeStr(obj.city, MAX_STR_LEN),
      priorities: pRes.value,
      themeNotes: sanitizeStr(obj.themeNotes, MAX_NOTES_LEN),
      guestNeeds: sanitizeStr(obj.guestNeeds, MAX_NOTES_LEN),
      culturalTraditions: sanitizeStr(obj.culturalTraditions, MAX_NOTES_LEN),
    },
  };
}
