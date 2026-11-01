import type { EventType, VendorItem } from "../types.js";

const WEDDING_VENDORS: readonly VendorItem[] = [
  { id: "v_venue", category: "venue", title: "Ceremony & Reception Venue", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_cater", category: "catering_bar", title: "Catering & Beverage Service", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_photo", category: "photography_video", title: "Photographer & Videographer", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_attire", category: "attire_beauty", title: "Bridal/Formal Wear & Hair/Makeup", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_decor", category: "decor_flowers", title: "Floral Designer & Event Rentals", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_music", category: "music_entertainment", title: "DJ / Live Musical Ensemble", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_stationery", category: "stationery_invites", title: "Invitations & Paper Goods", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_transport", category: "transport_logistics", title: "Guest Shuttle & Transport Service", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_officiant", category: "officiant_ceremony", title: "Wedding Officiant", status: "to-contact", quoteCents: 0, notes: "" },
] as const;

const BIRTHDAY_VENDORS: readonly VendorItem[] = [
  { id: "v_b_venue", category: "venue", title: "Party Venue / Event Hall", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_food", category: "food_drinks", title: "Party Caterer / Buffet Service", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_cake", category: "cake_desserts", title: "Custom Cake & Confections Bakery", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_decor", category: "decor_balloons", title: "Balloon Artist & Theme Decorator", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_entertain", category: "entertainment_activities", title: "Entertainer / DJ / Game Host", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_favors", category: "invitations_favors", title: "Invitations & Custom Party Favors", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_b_photo", category: "photography", title: "Event Photographer / Photo Booth", status: "to-contact", quoteCents: 0, notes: "" },
] as const;

const COMMUNITY_VENDORS: readonly VendorItem[] = [
  { id: "v_c_permits", category: "venue_permits", title: "City Permitting & Park Authority", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_food", category: "food_refreshments", title: "Local Food Vendors & Beverage Carts", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_av", category: "equipment_av", title: "AV Staging, Tents & Sound System", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_marketing", category: "marketing_outreach", title: "Banner Printing & Community Promo", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_perform", category: "program_entertainment", title: "Performers, Emcee & Workshop Hosts", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_safety", category: "volunteers_safety", title: "Safety Crew, First Aid & Marshals", status: "to-contact", quoteCents: 0, notes: "" },
  { id: "v_c_sanitation", category: "accessibility_cleanup", title: "Accessible Restrooms & Recycling Waste", status: "to-contact", quoteCents: 0, notes: "" },
] as const;

/**
 * Returns the initial vendor checklist items for an event type without fabricated personal quotes.
 */
export function getInitialVendors(eventType: EventType): VendorItem[] {
  if (eventType === "wedding") {
    return WEDDING_VENDORS.map((v) => ({ ...v }));
  }
  if (eventType === "birthday") {
    return BIRTHDAY_VENDORS.map((v) => ({ ...v }));
  }
  return COMMUNITY_VENDORS.map((v) => ({ ...v }));
}
