import { BIRTHDAY_TIMELINE_TEMPLATE } from "./data/timeline.birthday.js";
import { COMMUNITY_TIMELINE_TEMPLATE } from "./data/timeline.community.js";
import { WEDDING_TIMELINE_TEMPLATE } from "./data/timeline.wedding.js";
import type {
  EventType,
  TimelineTask,
  TimelineTemplateItem,
  ValidationResult,
} from "./types.js";
import { validateDate } from "./validation.js";

const MS_PER_DAY = 86_400_000;

function parseUtcMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function formatUtcMidnight(ms: number): string {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTemplate(eventType: EventType): readonly TimelineTemplateItem[] {
  if (eventType === "wedding") return WEDDING_TIMELINE_TEMPLATE;
  if (eventType === "birthday") return BIRTHDAY_TIMELINE_TEMPLATE;
  return COMMUNITY_TIMELINE_TEMPLATE;
}

function scaleOffset(daysBefore: number, leadDays: number, maxOffset: number): number {
  if (leadDays <= 0) return 0;
  if (leadDays >= maxOffset) return daysBefore;
  const scaled = Math.round((daysBefore * leadDays) / maxOffset);
  return Math.min(leadDays, Math.max(1, scaled));
}

/**
 * Builds a backward-scheduled milestone timeline from event date with automatic scaling for compressed schedules.
 */
export function buildTimeline(
  eventDate: string,
  today: string,
  eventType: EventType,
): ValidationResult<{
  timeline: TimelineTask[];
  compressed: boolean;
  leadDays: number;
}> {
  const eventRes = validateDate(eventDate);
  if (!eventRes.ok) return eventRes;

  const todayRes = validateDate(today);
  if (!todayRes.ok) return todayRes;

  const eventMs = parseUtcMidnight(eventRes.value);
  const todayMs = parseUtcMidnight(todayRes.value);
  const leadDays = Math.round((eventMs - todayMs) / MS_PER_DAY);

  if (leadDays < 0) {
    return { ok: false, error: "Event date cannot be in the past." };
  }

  const template = getTemplate(eventType);
  const maxOffset = Math.max(...template.map((t) => t.daysBefore));
  const compressed = leadDays < maxOffset;

  const timeline: TimelineTask[] = template.map((item) => {
    const effectiveDaysBefore = scaleOffset(item.daysBefore, leadDays, maxOffset);
    const dueMs = eventMs - effectiveDaysBefore * MS_PER_DAY;
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      daysBefore: effectiveDaysBefore,
      dueDate: formatUtcMidnight(dueMs),
      essential: item.essential,
      completed: false,
    };
  });

  return {
    ok: true,
    value: { timeline, compressed, leadDays },
  };
}

/**
 * Checks whether an uncompleted timeline task is overdue relative to the reference date.
 */
export function isOverdue(task: TimelineTask, today: string): boolean {
  if (task.completed) {
    return false;
  }
  return task.dueDate < today;
}
