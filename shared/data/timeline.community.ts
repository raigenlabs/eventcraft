import type { TimelineTemplateItem } from "../types.js";

export const COMMUNITY_TIMELINE_TEMPLATE: readonly TimelineTemplateItem[] = [
  { id: "c_permits", title: "Apply for Municipal Event & Park Permits", category: "venue_permits", daysBefore: 180, essential: true },
  { id: "c_venue", title: "Reserve Public Venue and Insurance Coverage", category: "venue_permits", daysBefore: 150, essential: true },
  { id: "c_sponsors", title: "Secure Community Partners and Sponsors", category: "marketing_outreach", daysBefore: 120, essential: false },
  { id: "c_performers", title: "Book Stage Performers and Guest Speakers", category: "program_entertainment", daysBefore: 90, essential: true },
  { id: "c_equipment", title: "Contract Audio/Visual, Stage and Tents", category: "equipment_av", daysBefore: 75, essential: true },
  { id: "c_marketing", title: "Launch Public Flyer, Press & Social Campaign", category: "marketing_outreach", daysBefore: 60, essential: false },
  { id: "c_volunteers", title: "Recruit Volunteers and Assign Safety Leads", category: "volunteers_safety", daysBefore: 45, essential: true },
  { id: "c_access", title: "Confirm ADA Ramps, Sanitation & First Aid", category: "accessibility_cleanup", daysBefore: 30, essential: true },
  { id: "c_cater", title: "Confirm Food Trucks and Water Stations", category: "food_refreshments", daysBefore: 21, essential: true },
  { id: "c_briefing", title: "Conduct Volunteer Safety and Station Briefing", category: "volunteers_safety", daysBefore: 7, essential: true },
  { id: "c_logistics", title: "Final Walkthrough with Venue and First Responders", category: "venue_permits", daysBefore: 2, essential: true },
  { id: "c_setup", title: "Site Load-in, Staging and Directional Signage", category: "equipment_av", daysBefore: 1, essential: true },
] as const;
