import type { TimelineTemplateItem } from "../types.js";

export const WEDDING_TIMELINE_TEMPLATE: readonly TimelineTemplateItem[] = [
  { id: "w_venue", title: "Book Ceremony and Reception Venues", category: "venue", daysBefore: 365, essential: true },
  { id: "w_photo", title: "Contract Lead Photographer & Videographer", category: "photography_video", daysBefore: 300, essential: true },
  { id: "w_cater", title: "Select Caterer and Schedule Menu Tasting", category: "catering_bar", daysBefore: 240, essential: true },
  { id: "w_attire", title: "Order Wedding Attire and Schedule Tailoring", category: "attire_beauty", daysBefore: 210, essential: true },
  { id: "w_music", title: "Hire Band or DJ & Finalize Audio Logistics", category: "music_entertainment", daysBefore: 180, essential: false },
  { id: "w_decor", title: "Finalize Floral Arrangements and Centerpieces", category: "decor_flowers", daysBefore: 150, essential: false },
  { id: "w_invites", title: "Send Formal Invitations and Track RSVPs", category: "stationery_invites", daysBefore: 90, essential: true },
  { id: "w_officiant", title: "Meet Officiant & Finalize Ceremony Script", category: "officiant_ceremony", daysBefore: 60, essential: true },
  { id: "w_transport", title: "Confirm Shuttle, Limousine & Guest Parking", category: "transport_logistics", daysBefore: 45, essential: false },
  { id: "w_headcount", title: "Submit Final Headcount & Seating Chart", category: "catering_bar", daysBefore: 21, essential: true },
  { id: "w_license", title: "Obtain Marriage License with Local Registry", category: "officiant_ceremony", daysBefore: 14, essential: true },
  { id: "w_rehearsal", title: "Conduct Ceremony Rehearsal with Party", category: "officiant_ceremony", daysBefore: 2, essential: true },
  { id: "w_runsheet", title: "Distribute Day-of Timeline to All Vendors", category: "transport_logistics", daysBefore: 1, essential: true },
] as const;
