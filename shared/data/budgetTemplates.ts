import type { EventType } from "../types.js";

export interface BudgetTemplateCategory {
  id: string;
  name: string;
  percentage: number;
  isContingency?: boolean;
}

export const WEDDING_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue", name: "Venue", percentage: 28 },
  { id: "catering_bar", name: "Catering & Bar", percentage: 30 },
  { id: "photography_video", name: "Photography & Video", percentage: 10 },
  { id: "attire_beauty", name: "Attire & Beauty", percentage: 7 },
  { id: "decor_flowers", name: "Decor & Flowers", percentage: 8 },
  { id: "music_entertainment", name: "Music & Entertainment", percentage: 6 },
  { id: "stationery_invites", name: "Stationery & Invitations", percentage: 2 },
  { id: "transport_logistics", name: "Transport & Logistics", percentage: 3 },
  { id: "officiant_ceremony", name: "Officiant & Ceremony", percentage: 1 },
  { id: "contingency", name: "Contingency", percentage: 5, isContingency: true },
] as const;

export const BIRTHDAY_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue", name: "Venue", percentage: 25 },
  { id: "food_drinks", name: "Food & Drinks", percentage: 35 },
  { id: "cake_desserts", name: "Cake & Desserts", percentage: 8 },
  { id: "decor_balloons", name: "Decor & Balloons", percentage: 10 },
  { id: "entertainment_activities", name: "Entertainment & Activities", percentage: 12 },
  { id: "invitations_favors", name: "Invitations & Favors", percentage: 4 },
  { id: "photography", name: "Photography", percentage: 2 },
  { id: "contingency", name: "Contingency", percentage: 4, isContingency: true },
] as const;

export const COMMUNITY_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue_permits", name: "Venue & Permits", percentage: 20 },
  { id: "food_refreshments", name: "Food & Refreshments", percentage: 25 },
  { id: "equipment_av", name: "Equipment (AV/Seating)", percentage: 15 },
  { id: "marketing_outreach", name: "Marketing & Outreach", percentage: 10 },
  { id: "program_entertainment", name: "Program & Entertainment", percentage: 12 },
  { id: "volunteers_safety", name: "Volunteers & Safety", percentage: 8 },
  { id: "accessibility_cleanup", name: "Accessibility & Cleanup", percentage: 5 },
  { id: "contingency", name: "Contingency", percentage: 5, isContingency: true },
] as const;

/**
 * Returns the immutable budget template categories for a given event type.
 */
export function getBudgetTemplate(eventType: EventType): readonly BudgetTemplateCategory[] {
  if (eventType === "wedding") {
    return WEDDING_BUDGET_TEMPLATE;
  }
  if (eventType === "birthday") {
    return BIRTHDAY_BUDGET_TEMPLATE;
  }
  return COMMUNITY_BUDGET_TEMPLATE;
}
