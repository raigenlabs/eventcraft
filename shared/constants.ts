export const PRIORITY_MULTIPLIER = 1.25;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 5000;
export const MIN_BUDGET_CENTS = 0;
export const MAX_BUDGET_CENTS = 100_000_000_000; // 1 billion in minor units (cents)
export const MAX_STR_LEN = 500;
export const MAX_NOTES_LEN = 1000;
export const MAX_PRIORITIES = 3;

export const NEAR_BUDGET_THRESHOLD = 0.9; // 90% of planned spend

export const RATE_LIMIT_MAX_TOKENS = 15;
export const RATE_LIMIT_REFILL_MS = 60_000; // 1 refill per 60,000 ms
export const RATE_LIMIT_EXPIRY_MS = 300_000; // 5 minutes bucket eviction

export const AI_TIMEOUT_MS = 30_000; // 30 seconds abort timeout
export const STORAGE_DEBOUNCE_MS = 300;
export const STORAGE_KEY = "eventcraft_plan_v1";

export const EVENT_TYPES = ["wedding", "birthday", "community"] as const;

export const VENDOR_STATUSES = [
  "to-contact",
  "contacted",
  "quoted",
  "booked",
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
