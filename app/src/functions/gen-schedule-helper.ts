// Define 15-minute time slots for finer granularity grid
export const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) {
  const hStr = h.toString().padStart(2, "0");
  TIME_SLOTS.push(`${hStr}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${hStr}:15`);
    TIME_SLOTS.push(`${hStr}:30`);
    TIME_SLOTS.push(`${hStr}:45`);
  }
}

// Full hours for header display (each hour spans 4 15-minute sub-columns)
export const HOURS_FOR_HEADER: number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// Days of the week
export const ALL_DAYS: string[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const WORK_DAYS: string[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export interface CourseEntry {
  id?: string;
  day: string;
  start: string;
  end: string;
  code: string;
  title: string;
  room: string;
  type: string;
  section: string;
  credits?: number; // Credits field
  color?: string;
}

export const DAY_COLORS: Record<string, { name: string; bg: string; text: string; border: string; hex: string }> = {
  MON: { name: "Amber", bg: "bg-amber-400", text: "text-slate-950", border: "border-amber-300", hex: "#fbbf24" },
  TUE: { name: "Rose", bg: "bg-rose-400", text: "text-slate-950", border: "border-rose-300", hex: "#fb7185" },
  WED: { name: "Emerald", bg: "bg-emerald-400", text: "text-slate-950", border: "border-emerald-300", hex: "#34d399" },
  THU: { name: "Orange", bg: "bg-orange-400", text: "text-slate-950", border: "border-orange-300", hex: "#fb923c" },
  FRI: { name: "Sky", bg: "bg-sky-400", text: "text-slate-950", border: "border-sky-300", hex: "#38bdf8" },
  SAT: { name: "Violet", bg: "bg-violet-400", text: "text-white", border: "border-violet-300", hex: "#a78bfa" },
  SUN: { name: "Red", bg: "bg-red-500", text: "text-white", border: "border-red-400", hex: "#ef4444" },
};

export const COLOR_PALETTES = [
  { name: "Default (Day Based)", bg: "bg-slate-700", text: "text-slate-100", border: "border-slate-600", hex: "#64748b" },
  ...Object.values(DAY_COLORS),
  { name: "Fuchsia", bg: "bg-fuchsia-500", text: "text-white", border: "border-fuchsia-400", hex: "#d946ef" },
  { name: "Teal", bg: "bg-teal-500", text: "text-slate-950", border: "border-teal-400", hex: "#14b8a6" },
  { name: "Indigo", bg: "bg-indigo-500", text: "text-white", border: "border-indigo-400", hex: "#6366f1" },
];

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== "string") return 8 * 60;
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 8 * 60;
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const clamped = Math.max(8 * 60, Math.min(20 * 60, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timeToColspan(start: string, end: string): number {
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  const diff = endMins - startMins;
  if (diff <= 0 || isNaN(diff)) {
    return 1;
  }
  // 15-minute base grid
  return Math.max(1, Math.ceil(diff / 15));
}

export function getStartSlotIndex(startTimeStr: string): number {
  const slotIdx = TIME_SLOTS.indexOf(startTimeStr);
  if (slotIdx !== -1) return slotIdx;

  const startMins = timeToMinutes(startTimeStr);
  const firstSlotMins = timeToMinutes(TIME_SLOTS[0]);
  
  if (startMins <= firstSlotMins) return 0;

  const diffMins = startMins - firstSlotMins;
  const approxIndex = Math.floor(diffMins / 15);
  return Math.max(0, Math.min(TIME_SLOTS.length - 1, approxIndex));
}

export function addMinutesToTime(startStr: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startStr);
  return minutesToTime(startMins + durationMinutes);
}

export function generateCourseId(): string {
  return "crs_" + Math.random().toString(36).substring(2, 9);
}

// Check if two course entries are identical in details
export function isSameCourseDetails(c1: CourseEntry, c2: CourseEntry): boolean {
  return (
    c1.code === c2.code &&
    c1.title === c2.title &&
    c1.room === c2.room &&
    c1.type === c2.type &&
    c1.section === c2.section &&
    c1.credits === c2.credits &&
    c1.day === c2.day &&
    c1.start === c2.start &&
    c1.end === c2.end
  );
}