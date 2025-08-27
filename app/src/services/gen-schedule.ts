// TypeScript translation of Python schedule generator functions for Vue
// Helper functions (timeToColspan, getStartSlotIndex, computeEnd, etc.) are imported from gen-schedule-helper.ts
import { timeToColspan, getStartSlotIndex, DAYS, TIME_SLOTS, HOURS_FOR_HEADER } from '../components/gen-schedule-helper.ts';

// Type for a class entry
export interface ClassEntry {
  day: string;
  start: string;
  end: string;
  code: string;
  title: string;
  room: string;
  type: string;
  section: string;
}

// Generate a single class cell as HTML string
export function gen_cell(cls: ClassEntry): string {
  const span = timeToColspan(cls.start, cls.end);
  const colorClasses: Record<string, string> = {
    MON: 'bg-yellow-400',
    TUE: 'bg-pink-400',
    WED: 'bg-green-400',
    THU: 'bg-orange-400',
    FRI: 'bg-blue-400',
    SAT: 'bg-purple-400',
    SUN: 'bg-red-400',
  };
  const color = colorClasses[cls.day] || 'bg-gray-700 text-neutral-900';
  return `\n        <td colspan="${span}" class="p-3 align-top ${color} text-neutral-900 rounded-lg overflow-hidden">\n            <div class="text-sm leading-tight">\n                <div class="mb-1 font-semibold">[${cls.start}-${cls.end}]</div>\n                <div class="font-bold">${cls.code}</div>\n                <div class="mb-1">${cls.title}</div>\n                <div class="text-xs opacity-90">${cls.room} | ${cls.type} ${cls.section}</div>\n            </div>\n        </td>`;
}

// Generate a single day's row as HTML string
export function gen_roll(day: string, classes: ClassEntry[], isLastRow: boolean): string {
  const dayColors: Record<string, string> = {
    MON: 'bg-yellow-400',
    TUE: 'bg-pink-400',
    WED: 'bg-green-400',
    THU: 'bg-orange-400',
    FRI: 'bg-blue-400',
    SAT: 'bg-purple-400',
    SUN: 'bg-red-400',
  };
  const dayColor = dayColors[day] || 'bg-gray-800 text-neutral-900 ';
  let row = `<tr class="h-25">`;
  row += `<td class="w-48 sticky left-0 z-20 px-4 py-3 font-bold text-center text-neutral-900 border-r border-gray-800 ${dayColor} whitespace-nowrap${!isLastRow ? ' border-b border-gray-800' : ''}"> ${day} </td>`;
  let slotPtr = 0;
  const sortedClasses = classes.filter(cls => cls.day === day).sort((a, b) => Date.parse(`1970-01-01T${a.start}:00`) - Date.parse(`1970-01-01T${b.start}:00`));
  for (const cls of sortedClasses) {
    const clsStartSlotIndex = getStartSlotIndex(cls.start.trim());
    const colspan = timeToColspan(cls.start, cls.end);
    const emptySlotsBefore = clsStartSlotIndex - slotPtr;
    for (let i = 0; i < emptySlotsBefore; i++) {
      row += `<td class="w-12${!isLastRow ? ' border-b border-gray-800' : ''}"></td>`;
    }
    slotPtr = clsStartSlotIndex;
    row += gen_cell(cls);
    slotPtr += colspan;
  }
  while (slotPtr < TIME_SLOTS.length) {
    row += `<td class="w-12${!isLastRow ? ' border-b border-gray-800' : ''}"></td>`;
    slotPtr++;
  }
  row += '</tr>';
  return row;
}

// Generate the complete schedule HTML
export function gen_schedule_html(classes: ClassEntry[]): string {
  let html = `<!doctype html>\n<html lang=\"en\" class=\"scroll-smooth\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Weekly Schedule</title>\n    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\" rel=\"stylesheet\">\n    <script src=\"https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4\"></script>\n</head>\n<body class=\"bg-[#0b0f1a] text-white min-h-screen flex flex-col items-center justify-center py-8 font-sans\">\n    <div class=\"overflow-x-auto w-[95vw] h-[96vh] rounded-xl shadow-2xl bg-[#111622] border border-gray-800\">\n        <table class=\"border-separate border-spacing-0 size-full text-sm\">\n            <thead>\n                <tr class=\"bg-[#111622] sticky top-0 z-20 border-b border-gray-800\">\n                    <th class=\"w-48 sticky left-0 z-[100] bg-[#111622] px-4 py-3 text-left font-semibold text-white rounded-tl-lg border-r border-gray-800\">Day/Time</th>`;
  for (const h of HOURS_FOR_HEADER) {
    html += `<th colspan=\"2\" class=\"px-4 py-3 w-24 text-center text-gray-300 font-medium whitespace-nowrap border-r border-b border-gray-800\">${h}:00</th>`;
  }
  html += '</tr></thead><tbody>';
  for (let i = 0; i < DAYS.length; i++) {
    const day = DAYS[i];
    const isLastRow = i === DAYS.length - 1;
    html += gen_roll(day, classes, isLastRow);
  }
  html += `</tbody></table>\n    </div>\n    <div class=\"text-right text-xs text-gray-400 p-4 mt-4 select-none\">created by Sirapob P.</div>\n</body>\n</html>`;
  return html;
}
