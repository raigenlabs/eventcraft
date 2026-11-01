import type { EventType, IntakeForm } from "../types.js";

export interface FallbackIdeaSet {
  themes: string[];
  decor: string[];
  menu: string[];
  activities: string[];
  favors: string[];
  entertainment: string[];
}

const WEDDING_IDEAS: FallbackIdeaSet = {
  themes: ["Modern Botanical Garden", "Timeless Candlelit Minimalist", "Rustic Chic Elegance"],
  decor: ["Cascading greenery & neutral linens", "Warm pillar candles & brass accents", "Statement floral arch"],
  menu: ["Seasonal farm-to-table plating", "Passed artisanal canapés & prosecco", "Late-night street taco bites"],
  activities: ["Audio guestbook phone station", "Personalized vows & ring-warming", "Couples shoe game dance icebreaker"],
  favors: ["Locally sourced honey jars", "Custom botanical seed packets", "Engraved wooden coasters"],
  entertainment: ["Acoustic string quartet for ceremony", "High-energy 7-piece live horn band", "Sparkler or bubbles sendoff"],
};

const BIRTHDAY_IDEAS: FallbackIdeaSet = {
  themes: ["Retro Disco Glow", "Golden Hour Garden Soirée", "Cosmic Stargazer Lounge"],
  decor: ["Monochromatic balloon clouds & neon signage", "Low-lying lounge cushions with fairy lights", "Foil photo backdrop with props"],
  menu: ["Interactive slider & gourmet fry bar", "Custom tiered centerpiece drip cake", "Signature mocktail / craft punch bowls"],
  activities: ["Milestone trivia & customized jeopardy", "DIY cocktail/mocktail crafting station", "Polaroid memory album signing"],
  favors: ["Personalized mini dessert gift boxes", "Customized graphic tote bags", "Theme scented candle tins"],
  entertainment: ["Curated live DJ with song request cards", "Roving close-up illusionist / mentalist", "Interactive karaoke battle hour"],
};

const COMMUNITY_IDEAS: FallbackIdeaSet = {
  themes: ["Neighborhood Unity & Roots Festival", "Green Planet Eco-Fair", "Harvest Street Jubilee"],
  decor: ["Bilingual community welcome banners", "Upcycled paper bunting & pennant flags", "Chalk-art walkway navigation guides"],
  menu: ["Multicultural food truck collective", "Locally baked treats & hydration hubs", "Community potluck dessert tables"],
  activities: ["All-ages mural painting wall", "Youth field games & relay challenges", "Local maker demonstrations & swaps"],
  favors: ["Native wildflower seed cards", "Reusable canvas market totes", "Community event commemorative pins"],
  entertainment: ["Local youth orchestra & choir showcase", "Acoustic open mic & storytelling stage", "Cultural dance troop performance"],
};

/**
 * Returns fallback structured ideas based on the intake event type.
 */
export function getFallbackIdeas(eventType: EventType): FallbackIdeaSet {
  if (eventType === "wedding") return WEDDING_IDEAS;
  if (eventType === "birthday") return BIRTHDAY_IDEAS;
  return COMMUNITY_IDEAS;
}

/**
 * Formats fallback ideas into a readable markdown/plain text stream for the ideas panel.
 */
export function formatFallbackIdeasText(intake: IntakeForm): string {
  const ideas = getFallbackIdeas(intake.eventType);
  return [
    `# Personalized Celebration Ideas for ${intake.name}`,
    `*Estimates and recommendations tailored for ${intake.guestCount} guests in ${intake.city || "your area"}.*`,
    "",
    "## Recommended Themes & Concepts",
    ...ideas.themes.map((t) => `- ${t}`),
    "",
    "## Decor & Atmosphere",
    ...ideas.decor.map((d) => `- ${d}`),
    "",
    "## Curated Food & Beverage",
    ...ideas.menu.map((m) => `- ${m}`),
    "",
    "## Interactive Activities & Highlights",
    ...ideas.activities.map((a) => `- ${a}`),
    "",
    "## Thoughtful Favors & Take-Homes",
    ...ideas.favors.map((f) => `- ${f}`),
    "",
    "## Entertainment & Music",
    ...ideas.entertainment.map((e) => `- ${e}`),
  ].join("\n");
}
