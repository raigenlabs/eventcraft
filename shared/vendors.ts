import { MAX_BUDGET_CENTS, MAX_NOTES_LEN } from "./constants.js";
import { sanitizeStr } from "./sanitize.js";
import type { ValidationResult, VendorItem, VendorStatus } from "./types.js";
import { validateVendorStatus } from "./validation.js";

const DEFAULT_GUIDANCE = {
  questions: [
    "What is included in the base pricing versus additional fees?",
    "What is your cancellation and rescheduling policy?",
    "Do you carry liability insurance and backup staff?",
  ],
  redFlags: [
    "Refusal to provide a written itemized contract",
    "Demanding 100% upfront cash payment without milestones",
    "Slow communication and reluctance to share verifiable references",
  ],
};

const CATEGORY_GUIDANCE: Record<string, { questions: string[]; redFlags: string[] }> = {
  venue: {
    questions: [
      "What are the load-in, setup, and cleanup time windows?",
      "Are there exclusive vendor restrictions or noise curfews?",
      "What is the weather contingency plan for outdoor areas?",
    ],
    redFlags: [
      "Unclear overtime fees or hidden cleaning surcharges",
      "No designated venue coordinator on event day",
      "Unverified capacity limits or missing fire permits",
    ],
  },
  catering_bar: {
    questions: [
      "Are tableware, linens, and bar staff included in the quote?",
      "How do you handle dietary restrictions, allergies, and vendor meals?",
      "Is gratuity and service charge included in the per-person rate?",
    ],
    redFlags: [
      "No food safety license or commercial kitchen certification",
      "Vague portion sizes and no pre-event tasting option",
      "Hidden corkage or cake-cutting service fees",
    ],
  },
  photography_video: {
    questions: [
      "How many hours of coverage and how many shooters are included?",
      "What is the delivery turnaround time and photo rights policy?",
      "What is your backup equipment protocol if a camera fails?",
    ],
    redFlags: [
      "Portfolio with inconsistent style or only stock photos",
      "Turnaround longer than 8 weeks with no interim preview",
      "No contract clause specifying replacement in case of illness",
    ],
  },
};

/**
 * Returns structured fallback questions and red flags for a given vendor category.
 */
export function getCategoryGuidanceFallback(
  category: string,
): { questions: string[]; redFlags: string[] } {
  return CATEGORY_GUIDANCE[category] ?? DEFAULT_GUIDANCE;
}

function resolveVendorQuote(rawQuote: unknown, currentQuote: number): ValidationResult<number> {
  if (rawQuote === undefined) {
    return { ok: true, value: currentQuote };
  }
  if (
    typeof rawQuote !== "number" ||
    !Number.isInteger(rawQuote) ||
    rawQuote < 0 ||
    rawQuote > MAX_BUDGET_CENTS
  ) {
    return { ok: false, error: "Quote must be a non-negative integer in minor units." };
  }
  return { ok: true, value: rawQuote };
}

function resolveVendorStatus(
  rawStatus: unknown,
  currentStatus: VendorStatus,
  quote: number,
): ValidationResult<VendorStatus> {
  if (rawStatus === undefined) {
    return { ok: true, value: currentStatus };
  }
  const stRes = validateVendorStatus(rawStatus);
  if (!stRes.ok) return stRes;
  if (stRes.value === "quoted" && (quote < 0 || !Number.isInteger(quote))) {
    return { ok: false, error: "Quoted status requires a quote ≥ 0." };
  }
  return stRes;
}

/**
 * Updates a vendor item immutably while enforcing typed status transitions and non-negative quote validation.
 */
export function updateVendorItem(
  items: VendorItem[],
  id: string,
  patch: {
    status?: VendorStatus;
    quoteCents?: number;
    notes?: string;
  },
): ValidationResult<VendorItem[]> {
  const index = items.findIndex((item) => item.id === id);
  const current = items[index];
  if (index === -1 || !current) {
    return { ok: false, error: "Vendor item not found." };
  }

  const quoteRes = resolveVendorQuote(patch.quoteCents, current.quoteCents);
  if (!quoteRes.ok) return quoteRes;

  const statusRes = resolveVendorStatus(patch.status, current.status, quoteRes.value);
  if (!statusRes.ok) return statusRes;

  const nextNotes = patch.notes !== undefined
    ? sanitizeStr(patch.notes, MAX_NOTES_LEN)
    : current.notes;

  const copy = [...items];
  copy[index] = {
    ...current,
    status: statusRes.value,
    quoteCents: quoteRes.value,
    notes: nextNotes,
  };
  return { ok: true, value: copy };
}
