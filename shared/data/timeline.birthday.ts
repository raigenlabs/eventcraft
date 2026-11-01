import type { TimelineTemplateItem } from "../types.js";

export const BIRTHDAY_TIMELINE_TEMPLATE: readonly TimelineTemplateItem[] = [
  { id: "b_venue", title: "Reserve Party Venue or Space", category: "venue", daysBefore: 90, essential: true },
  { id: "b_theme", title: "Decide Theme and Entertainment Concepts", category: "entertainment_activities", daysBefore: 60, essential: false },
  { id: "b_entertainer", title: "Book Entertainer, DJ or Activity Host", category: "entertainment_activities", daysBefore: 45, essential: true },
  { id: "b_invites", title: "Send Invitations and Collect Dietary Needs", category: "invitations_favors", daysBefore: 30, essential: true },
  { id: "b_cater", title: "Order Party Catering, Drinks and Snacks", category: "food_drinks", daysBefore: 21, essential: true },
  { id: "b_cake", title: "Order Custom Birthday Cake and Sweets", category: "cake_desserts", daysBefore: 14, essential: true },
  { id: "b_decor", title: "Purchase Balloons, Tableware and Decorations", category: "decor_balloons", daysBefore: 10, essential: false },
  { id: "b_favors", title: "Assemble Gift Bags and Party Favors", category: "invitations_favors", daysBefore: 5, essential: false },
  { id: "b_photo", title: "Confirm Photographer or Design Photo Booth", category: "photography", daysBefore: 4, essential: false },
  { id: "b_confirm", title: "Confirm Final Attendance and Setup Access Time", category: "venue", daysBefore: 2, essential: true },
  { id: "b_setup", title: "Coordinate Venue Setup and Playlist Check", category: "decor_balloons", daysBefore: 1, essential: true },
] as const;
