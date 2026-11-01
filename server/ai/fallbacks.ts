import { formatFallbackIdeasText } from "../../shared/data/fallbackIdeas.js";
import type { EventPlan, IntakeForm, VendorGuidanceResponse } from "../../shared/types.js";
import { getCategoryGuidanceFallback } from "../../shared/vendors.js";

/**
 * Generates fallback ideas text when AI is unavailable.
 */
export function getIdeasFallback(intake: IntakeForm): string {
  return formatFallbackIdeasText(intake);
}

/**
 * Generates fallback assistant responses grounded in the current plan.
 */
export function getAssistantFallback(plan: EventPlan, query: string): string {
  const q = query.toLowerCase();

  if (q.includes("forgetting") || q.includes("checklist")) {
    const uncompleted = plan.timeline.filter((t) => !t.completed);
    const topNext = uncompleted.slice(0, 3).map((t) => `• ${t.title} (Due: ${t.dueDate})`).join("\n");
    return [
      `Based on your current plan for "${plan.intake.name}", here are top items to keep front-of-mind:`,
      "",
      topNext || "All scheduled milestones are currently marked complete!",
      "",
      "Don't forget day-of essentials: emergency kit (safety pins, stain remover), vendor contact list, and tip envelopes.",
    ].join("\n");
  }

  if (q.includes("cut") || q.includes("10%") || q.includes("reduce budget")) {
    const nonContingency = plan.budget.filter((b) => !b.isContingency);
    const topCats = [...nonContingency]
      .sort((a, b) => b.plannedCents - a.plannedCents)
      .slice(0, 2)
      .map((b) => `• ${b.name}: Currently planned at ${(b.plannedCents / 100).toFixed(2)} ${plan.intake.currency}. Trimming here yields the highest impact.`)
      .join("\n");

    return [
      `To reduce your budget by ~10% (${((plan.intake.totalBudgetCents * 0.1) / 100).toFixed(2)} ${plan.intake.currency}):`,
      "",
      topCats,
      "• Consider buffet or family-style service instead of formal plated courses.",
      "• Limit bar offerings to beer, wine, and 2 signature drinks rather than a full open bar.",
      "• Opt for digital invitations or seasonal local greenery.",
    ].join("\n");
  }

  if (q.includes("rain") || q.includes("weather") || q.includes("backup")) {
    return [
      `Weather contingency guidance for "${plan.intake.name}":`,
      "",
      "• Confirm tent deposit deadlines and sidewall availability with your rental provider.",
      "• Define an exact go/no-go cutoff time with your venue (typically 24 to 48 hours prior).",
      "• Designate covered spaces for photo sessions and guest arrivals.",
      "• Have clear umbrella stations and floor mats positioned at entry points.",
    ].join("\n");
  }

  return [
    `Planning guidance for "${plan.intake.name}":`,
    `You are planning for ${plan.intake.guestCount} guests on ${plan.intake.date} with a total budget of ${(plan.intake.totalBudgetCents / 100).toFixed(2)} ${plan.intake.currency}.`,
    "",
    "Focus on securing high-priority vendors first, confirming contracts in writing, and keeping a 5% contingency buffer for unforeseen expenses.",
  ].join("\n");
}

/**
 * Generates an executive summary fallback grounded in plan figures.
 */
export function getSummaryFallback(plan: EventPlan): string {
  const totalPlanned = plan.budget.reduce((acc, c) => acc + c.plannedCents, 0) / 100;
  const totalActual = plan.budget.reduce((acc, c) => acc + c.actualCents, 0) / 100;
  const bookedCount = plan.vendors.filter((v) => v.status === "booked").length;
  const completedTasks = plan.timeline.filter((t) => t.completed).length;

  return [
    `# Executive Event Plan Summary: ${plan.intake.name}`,
    `Generated on: ${new Date().toISOString().slice(0, 10)} | Mode: Template-Based Plan Audit`,
    "",
    "## 1. Overview & Key Parameters",
    `- Event Type: ${plan.intake.eventType.toUpperCase()}`,
    `- Event Date: ${plan.intake.date} (${plan.warnings.leadDays} days lead time)`,
    `- Location: ${plan.intake.city || "Local"}`,
    `- Guest Count: ${plan.intake.guestCount} confirmed attendees`,
    `- Total Target Budget: ${totalPlanned.toLocaleString()} ${plan.intake.currency}`,
    "",
    "## 2. Budget & Financial Health",
    `- Total Planned Spend: ${totalPlanned.toLocaleString()} ${plan.intake.currency}`,
    `- Current Actual / Committed Spend: ${totalActual.toLocaleString()} ${plan.intake.currency}`,
    `- Over-budget Categories: ${plan.warnings.overBudgetCount}`,
    `- Note: All figures are planning guidelines and estimates, not binding quotes.`,
    "",
    "## 3. Milestones & Timeline",
    `- Total Scheduled Milestones: ${plan.timeline.length}`,
    `- Completed Milestones: ${completedTasks}`,
    `- Overdue Milestones: ${plan.warnings.overdueTaskCount}`,
    `- Schedule State: ${plan.warnings.compressedTimeline ? "Compressed schedule active" : "Standard lead timeline"}`,
    "",
    "## 4. Vendor Procurement Status",
    `- Total Vendor Tracks: ${plan.vendors.length}`,
    `- Booked / Contracted: ${bookedCount} of ${plan.vendors.length}`,
    "",
    "## 5. Next Strategic Priorities",
    "• Review vendor quotes and confirm insurance and cancellation clauses.",
    "• Monitor overdue milestones and re-allocate tasks as necessary.",
    "• Maintain strict adherence to contingency reserves.",
  ].join("\n");
}

/**
 * Generates fallback vendor guidance response.
 */
export function getVendorGuidanceFallbackResponse(
  category: string,
): VendorGuidanceResponse {
  const guidance = getCategoryGuidanceFallback(category);
  return {
    category,
    questions: guidance.questions,
    redFlags: guidance.redFlags,
    source: "fallback",
  };
}
