 // Define time slots in 30-minute increments for finer granularity
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:30`);
  }
}

// Example TIME_SLOTS: ['08:00', '08:30', '09:00', '09:30', ..., '20:00']

// Full hours for header display
const HOURS_FOR_HEADER: number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// Days of the week
const DAYS: string[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Export if needed
export { TIME_SLOTS, HOURS_FOR_HEADER, DAYS };

export function timeToColspan(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  let totalMinutes = endMinutes - startMinutes;

  if (totalMinutes < 0) {
    throw new Error("End time must be after start time");
  }

  // Calculate colspan based on 30-minute intervals, rounding up
  return Math.max(1, Math.ceil(totalMinutes / 30));
}

function parseTime(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function getStartSlotIndex(startTimeStr: string): number {
    try {
        return TIME_SLOTS.indexOf(startTimeStr);
    }
    catch(ValueError) {
        // If the time is not exactly on a 00 or 30 mark,
        // round down to the nearest 30-minute interval for placement.
        const startDT: Date = parseTime(startTimeStr);
        const minute: number = startDT.getMinutes();
        const hour: number = startDT.getHours();
        let alignedTimeStr: string;
        if (minute < 30) {
            alignedTimeStr = `${hour.toString().padStart(2, "0")}:00`;
        } else {
            alignedTimeStr = `${hour.toString().padStart(2, "0")}:30`;
        }
    try {
        return TIME_SLOTS.indexOf(alignedTimeStr);
    }
    catch(ValueError) {
        // Fallback if somehow still not found (shouldn't happen with proper TIME_SLOTS)
        return 0; // Default to the very beginning if something goes wrong
        }
    }
}

export function computeEnd(start: string, duration: string): string {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [durationHour, durationMinute] = duration.split(":").map(Number);
    const startDT = new Date();
    startDT.setHours(startHour, startMinute, 0, 0);
    startDT.setHours(startDT.getHours() + durationHour);
    startDT.setMinutes(startDT.getMinutes() + durationMinute);
    const endHour = startDT.getHours().toString().padStart(2, "0");
    const endMinute = startDT.getMinutes().toString().padStart(2, "0");
    return `${endHour}:${endMinute}`;
}