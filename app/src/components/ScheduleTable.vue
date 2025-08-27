<template>
  <div class="overflow-w-auto w-[95vw] h-[80vh] rounded-xl shadow-2xl bg-[#111622] border border-gray-800">
    <table class="border-separate border-spacing-0 size-full text-sm">
      <thead>
        <tr class="bg-[#111622] sticky top-0 z-20 border-b border-gray-800">
          <th class="w-48 sticky left-0 z-[100] bg-[#111622] px-4 py-3 text-left font-semibold text-white rounded-tl-lg border-r border-gray-800">
            Day/Time
          </th>
          <th v-for="h in HOURS_FOR_HEADER" :key="h" colspan="2" class="px-4 py-3 w-24 text-center text-gray-300 font-medium whitespace-nowrap border-r border-b border-gray-800">
            {{ h }}:00
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(day, i) in DAYS" :key="day" class="h-25">
          <td :class="['w-48 sticky left-0 z-20 px-4 py-3 font-bold text-center text-neutral-900 border-r border-gray-800 whitespace-nowrap', dayColors[day] || 'bg-gray-800 text-neutral-900', i !== DAYS.length - 1 ? 'border-b border-gray-800' : '']">
            {{ day }}
          </td>
          <template v-for="cell in getRowCells(day, i === DAYS.length - 1)">
            <td v-if="cell.type === 'empty'" :colspan="cell.colspan" :class="['w-12', !cell.isLastRow ? 'border-b border-gray-800' : '']"></td>
            <td v-else v-html="cell.html" :colspan="cell.colspan"></td>
          </template>
        </tr>
      </tbody>
    </table>
    <div class="text-right text-xs text-gray-400 p-4 mt-4 select-none">created by YAST</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { timeToColspan, getStartSlotIndex, computeEnd, DAYS, TIME_SLOTS, HOURS_FOR_HEADER } from '../components/gen-schedule-helper.ts';

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

export default defineComponent({
  name: 'ScheduleTable',
  props: {
    modelValue: {
      type: Array as PropType<ClassEntry[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dayColors: Record<string, string> = {
      MON: 'bg-yellow-400',
      TUE: 'bg-pink-400',
      WED: 'bg-green-400',
      THU: 'bg-orange-400',
      FRI: 'bg-blue-400',
      SAT: 'bg-purple-400',
      SUN: 'bg-red-400',
    };

    function genCell(cls: ClassEntry): { html: string; colspan: number; type: 'class'; isLastRow: boolean } {
      const span = timeToColspan(cls.start, cls.end);
      const color = dayColors[cls.day] || 'bg-gray-700 text-neutral-900';
      const html = `
        <div class="p-3 align-top ${color} text-neutral-900 rounded-lg overflow-hidden">
          <div class="text-sm leading-tight">
            <div class="mb-1 font-semibold">[${cls.start}-${cls.end}]</div>
            <div class="font-bold">${cls.code}</div>
            <div class="mb-1">${cls.title}</div>
            <div class="text-xs opacity-90">${cls.room} | ${cls.type} ${cls.section}</div>
          </div>
        </div>`;
      return { html, colspan: span, type: 'class', isLastRow: false };
    }

    function getRowCells(day: string, isLastRow: boolean) {
      let slotPtr = 0;
      // Always use the latest modelValue for reactivity
      const sortedClasses = (props.modelValue ?? [])
        .filter(cls => cls.day === day)
        .sort((a, b) => Date.parse(`1970-01-01T${a.start}:00`) - Date.parse(`1970-01-01T${b.start}:00`));
      const cells: Array<{ type: 'empty' | 'class'; colspan: number; html?: string; isLastRow: boolean }> = [];
      for (const cls of sortedClasses) {
        const clsStartSlotIndex = getStartSlotIndex(cls.start.trim());
        const colspan = timeToColspan(cls.start, cls.end);
        const emptySlotsBefore = clsStartSlotIndex - slotPtr;
        if (emptySlotsBefore > 0) {
          cells.push({ type: 'empty', colspan: emptySlotsBefore, isLastRow });
        }
        slotPtr = clsStartSlotIndex;
        cells.push({ ...genCell(cls), isLastRow });
        slotPtr += colspan;
      }
      if (slotPtr < TIME_SLOTS.length) {
        cells.push({ type: 'empty', colspan: TIME_SLOTS.length - slotPtr, isLastRow });
      }
      return cells;
    }

    return {
      DAYS,
      HOURS_FOR_HEADER,
      dayColors,
      getRowCells,
    };
  },
});
</script>

<style scoped>
/* Add any additional styling if needed */
</style>
