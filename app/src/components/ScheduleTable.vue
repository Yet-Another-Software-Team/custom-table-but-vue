<template>
  <div class="space-y-4">
    <!-- Schedule Table Card Container -->
    <div
      ref="tableContainer"
      class="relative rounded-2xl shadow-2xl bg-[#0f172a]/95 backdrop-blur-md border border-slate-800 overflow-hidden text-slate-100 select-none custom-scrollbar"
    >
      <!-- Top Bar inside Table Container -->
      <div class="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 gap-4">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <h2 class="text-lg font-bold bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
            <Icon icon="ic:baseline-calendar-month" class="w-5 h-5 text-cyan-400 inline" />
            <span>Weekly Schedule</span>
          </h2>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <!-- Total Credits & Hours summary -->
          <div class="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <span class="flex items-center gap-1 text-cyan-400 font-bold">
              <Icon icon="ic:baseline-school" class="w-4 h-4" />
              {{ totalCredits }} Credits
            </span>
            <span class="text-slate-600">|</span>
            <span class="flex items-center gap-1 text-indigo-300 font-bold">
              <Icon icon="ic:baseline-access-time" class="w-4 h-4" />
              {{ totalWeeklyHours }} hrs/wk
            </span>
          </div>
        </div>
      </div>

      <!-- Main Table -->
      <div class="overflow-x-auto relative">
        <table class="w-full border-collapse min-w-[1100px] table-fixed">
          <!-- Colgroup for 48 sub-columns (15-min each) -->
          <colgroup>
            <col style="width: 75px" />
            <col
              v-for="(_, index) in NUM_SLOTS"
              :key="'col-' + index"
              style="width: 22px"
            />
          </colgroup>

          <!-- Table Header -->
          <thead>
            <tr class="bg-slate-900/90 sticky top-0 z-20 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <th class="sticky left-0 z-30 bg-slate-900 px-2 py-3 text-center border-r border-slate-800 shadow-md">
                Day / Time
              </th>
              <!-- Each hour header spans 4 15-minute slots -->
              <th
                v-for="h in HOURS_FOR_HEADER"
                :key="'h-' + h"
                :colspan="4"
                class="px-1 py-2.5 text-center border-r border-slate-800 font-mono text-[11px] text-slate-400 bg-slate-900/60"
              >
                {{ h }}:00
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <tr
              v-for="(day, dayIdx) in activeDays"
              :key="day"
              class="h-24 transition-colors hover:bg-slate-800/20"
            >
              <!-- Day Header Cell (Sticky Left) -->
              <td
                :class="[
                  'sticky left-0 z-20 px-2 py-3 font-bold text-center border-r border-slate-800 text-xs shadow-md transition-all',
                  getDayBadgeStyle(day),
                  dayIdx !== activeDays.length - 1 ? 'border-b border-slate-800' : ''
                ]"
              >
                <div class="flex flex-col items-center justify-center gap-0.5">
                  <span class="tracking-wider font-extrabold text-slate-950">{{ day }}</span>
                </div>
              </td>

              <!-- Slot & Course Cells -->
              <td
                v-for="cell in rowLayouts[day] || []"
                :key="cell.key"
                :colspan="cell.colspan"
                :class="[
                  'relative p-1 align-top transition-colors',
                  cell.isCourse ? 'z-10' : 'hover:bg-cyan-500/10 cursor-pointer',
                  isTargetSlot(day, cell.slotIndex) ? 'bg-cyan-500/25 border-2 border-dashed border-cyan-400' : '',
                  dayIdx !== activeDays.length - 1 ? 'border-b border-slate-800/60' : '',
                  // Outlined hour lines only at 4-slot boundaries
                  (cell.slotIndex + cell.colspan) % 4 === 0 ? 'border-r border-slate-800' : 'border-r-0'
                ]"
                @dragover.prevent="onSlotDragOver($event, day, cell.slotIndex)"
                @dragleave="onSlotDragLeave"
                @drop="onSlotDrop($event, day, cell.slotIndex)"
                @click="onSlotClick(day, cell.slotIndex, cell.isCourse)"
              >
                <!-- EMPTY SLOT RENDER -->
                <div
                  v-if="!cell.isCourse"
                  class="w-full h-full min-h-[5rem] rounded-lg border border-transparent hover:border-cyan-500/30 flex items-center justify-center group"
                >
                  <span class="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-1.5 py-0.5 rounded shadow transition-opacity">
                    + {{ TIME_SLOTS[cell.slotIndex] }}
                  </span>
                </div>

                <!-- COURSE CARD RENDER -->
                <div
                  v-else-if="cell.course"
                  :draggable="true"
                  :class="[
                    'w-full h-full p-2.5 rounded-xl border shadow-lg flex flex-col justify-between transition-all duration-75 transform hover:-translate-y-0.5 hover:shadow-cyan-500/10 relative overflow-hidden group cursor-grab active:cursor-grabbing',
                    getCourseCardStyle(cell.course),
                    activeDragCourseId === cell.course.id ? 'opacity-30 scale-95 border-dashed border-cyan-400' : ''
                  ]"
                  @dragstart="onCourseDragStart($event, cell.course)"
                  @dragend="onCourseDragEnd"
                  @click.stop="openEditModal(cell.course)"
                >
                  <!-- Card Header: Time & Badges -->
                  <div class="flex items-start justify-between gap-1 mb-1">
                    <div class="flex items-center gap-1 font-mono text-[11px] font-bold opacity-90">
                      <span>{{ cell.course.start }} - {{ cell.course.end }}</span>
                    </div>

                    <div class="flex items-center gap-1">
                      <!-- Overlap Warning -->
                      <span
                        v-if="cell.hasOverlap"
                        title="Conflict with another course"
                        class="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-bounce shadow"
                      >
                        <Icon icon="ic:baseline-warning" class="w-3 h-3" />
                        Conflict
                      </span>

                      <!-- Duplicate Badge -->
                      <span
                        v-if="cell.isDuplicate"
                        title="Identical copy of another course"
                        class="bg-amber-400 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      >
                        <Icon icon="ic:baseline-content-copy" class="w-3 h-3" />
                        Same
                      </span>

                      <!-- Type & Credits Badge -->
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-sm font-semibold uppercase tracking-wider">
                        {{ cell.course.credits || 3 }}cr
                      </span>
                    </div>
                  </div>

                  <!-- Course Code & Title -->
                  <div class="my-auto">
                    <div class="font-black text-xs tracking-tight leading-snug drop-shadow-sm flex items-center justify-between">
                      <span>{{ cell.course.code }}</span>
                      <span class="text-[10px] font-medium opacity-80 uppercase">{{ cell.course.type || 'Lec' }}</span>
                    </div>
                    <div class="font-medium text-[11px] leading-tight opacity-95 line-clamp-2 mt-0.5">
                      {{ cell.course.title }}
                    </div>
                  </div>

                  <!-- Room & Section -->
                  <div class="flex items-center justify-between mt-1 text-[10px] font-medium opacity-85">
                    <span class="truncate flex items-center gap-1">
                      <Icon icon="ic:baseline-location-on" class="w-3 h-3" />
                      {{ cell.course.room || 'TBA' }}
                    </span>
                    <span>Sec {{ cell.course.section || '1' }}</span>
                  </div>

                  <!-- Action Buttons on Hover -->
                  <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 shadow-md z-20">
                    <button
                      @click.stop="duplicateCourse(cell.course)"
                      class="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800"
                      title="Duplicate / Copy Course"
                    >
                      <Icon icon="ic:baseline-content-copy" class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click.stop="openEditModal(cell.course)"
                      class="text-amber-400 hover:text-amber-300 p-1 rounded hover:bg-slate-800"
                      title="Edit Course"
                    >
                      <Icon icon="ic:baseline-edit" class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click.stop="removeCourse(cell.course)"
                      class="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800"
                      title="Delete Course"
                    >
                      <Icon icon="ic:baseline-delete" class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Resize Handle (Right edge) -->
                  <div
                    class="absolute top-0 right-0 w-2.5 h-full cursor-ew-resize hover:bg-white/30 transition-colors flex items-center justify-center group/resize"
                    title="Drag edge to resize duration (15-min steps)"
                    @pointerdown.stop.prevent="startResizing($event, cell.course)"
                  >
                    <div class="w-1 h-6 rounded-full bg-white/40 group-hover/resize:bg-white"></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Branding -->
      <div class="flex items-center justify-between px-6 py-2.5 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-500">
        <span class="flex items-center gap-1.5">
          <Icon icon="ic:baseline-auto-awesome" class="w-4 h-4 text-cyan-400" />
          Week Wizard • Modern Schedule Builder
        </span>
        <span>Created by <a href="https://github.com/Yet-Another-Software-Team" target="_blank" class="text-cyan-400 hover:underline">YAST</a></span>
      </div>
    </div>

    <!-- Quick Edit / Add Modal Popover -->
    <div
      v-if="editingCourse"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Icon :icon="isNewCourse ? 'ic:baseline-add-circle' : 'ic:baseline-edit'" class="w-5 h-5 text-cyan-400" />
            <span>{{ isNewCourse ? 'Add New Course' : 'Edit Course' }}</span>
          </h3>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- Day & Time row -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Day</label>
              <select
                v-model="editingCourse.day"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              >
                <option v-for="d in ALL_DAYS" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
              <select
                v-model="editingCourse.start"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
              >
                <option v-for="t in startTimes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">End Time</label>
              <select
                v-model="editingCourse.end"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
              >
                <option v-for="t in validEndTimes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <!-- Code & Title -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Course Code</label>
              <input
                v-model="editingCourse.code"
                type="text"
                placeholder="e.g. 01219366"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-400 mb-1">Course Title</label>
              <input
                v-model="editingCourse.title"
                type="text"
                placeholder="e.g. Software Engineering"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Room, Type, Section, Credits -->
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Room</label>
              <input
                v-model="editingCourse.room"
                type="text"
                placeholder="e.g. E11-S603"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Type</label>
              <select
                v-model="editingCourse.type"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Section</label>
              <input
                v-model="editingCourse.section"
                type="text"
                placeholder="e.g. 1"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Credits</label>
              <input
                v-model.number="editingCourse.credits"
                type="number"
                min="1"
                max="12"
                placeholder="3"
                class="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Color Theme Picker -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-2">Color Theme</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="palette in COLOR_PALETTES"
                :key="palette.name"
                type="button"
                :class="[
                  'w-8 h-8 rounded-full transition-transform border-2 flex items-center justify-center text-xs font-bold',
                  palette.bg,
                  (editingCourse.color === palette.name || (!editingCourse.color && palette.name.includes('Default')))
                    ? 'scale-110 border-white ring-2 ring-cyan-400'
                    : 'border-transparent opacity-80 hover:opacity-100'
                ]"
                @click="editingCourse.color = palette.name"
                :title="palette.name"
              >
                <Icon
                  v-if="editingCourse.color === palette.name || (!editingCourse.color && palette.name.includes('Default'))"
                  icon="ic:baseline-check"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/50">
          <div class="flex items-center gap-2">
            <button
              v-if="!isNewCourse"
              @click="duplicateCourse(editingCourse); closeModal();"
              class="px-3.5 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Icon icon="ic:baseline-content-copy" class="w-4 h-4" />
              Duplicate
            </button>
            <button
              v-if="!isNewCourse"
              @click="removeCourse(editingCourse); closeModal();"
              class="px-3.5 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Icon icon="ic:baseline-delete" class="w-4 h-4" />
              Delete
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveCourse"
              class="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Icon icon="ic:baseline-save" class="w-4 h-4" />
              {{ isNewCourse ? 'Add Course' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import {
  TIME_SLOTS,
  HOURS_FOR_HEADER,
  ALL_DAYS,
  WORK_DAYS,
  DAY_COLORS,
  COLOR_PALETTES,
  timeToMinutes,
  minutesToTime,
  timeToColspan,
  getStartSlotIndex,
  generateCourseId,
  isSameCourseDetails,
  type CourseEntry,
} from "../functions/gen-schedule-helper";

const props = withDefaults(
  defineProps<{
    modelValue: CourseEntry[];
    includeSunday?: boolean;
  }>(),
  {
    includeSunday: false,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", courses: CourseEntry[]): void;
}>();

// Number of 15-min intervals
const NUM_SLOTS = TIME_SLOTS.length - 1; // 48 slots

const activeDays = computed(() => (props.includeSunday ? ALL_DAYS : WORK_DAYS));

// Active drag state
const activeDragCourseId = ref<string | null>(null);
const draggedCourseRef = ref<CourseEntry | null>(null);
const dropTargetSlot = ref<{ day: string; slotIndex: number } | null>(null);

// Fast check for active drop target slot
function isTargetSlot(day: string, slotIndex: number): boolean {
  return dropTargetSlot.value?.day === day && dropTargetSlot.value?.slotIndex === slotIndex;
}

// Editing Modal state
const editingCourse = ref<CourseEntry | null>(null);
const isNewCourse = ref<boolean>(false);

// Start times list for select dropdown
const startTimes = computed(() => TIME_SLOTS.slice(0, -1));

const validEndTimes = computed(() => {
  if (!editingCourse.value?.start) return TIME_SLOTS.slice(1);
  const startMins = timeToMinutes(editingCourse.value.start);
  return TIME_SLOTS.filter((t) => timeToMinutes(t) > startMins);
});

// Summary Stats
const totalCredits = computed(() => {
  return (props.modelValue || []).reduce((acc, c) => acc + (c.credits || 3), 0);
});

const totalWeeklyHours = computed(() => {
  let totalMins = 0;
  for (const c of props.modelValue || []) {
    const startMins = timeToMinutes(c.start);
    const endMins = timeToMinutes(c.end);
    if (endMins > startMins) totalMins += endMins - startMins;
  }
  return (totalMins / 60).toFixed(1);
});

// Color badge helper for Day sticky headers
function getDayBadgeStyle(day: string): string {
  const dayColor = DAY_COLORS[day];
  return dayColor ? `${dayColor.bg} text-slate-950` : "bg-slate-700 text-white";
}

// Course Card styling (defaulting to Day-based color)
function getCourseCardStyle(course: CourseEntry): string {
  if (course.color && course.color !== "Default (Day Based)") {
    const palette = COLOR_PALETTES.find((p) => p.name === course.color);
    if (palette) return `${palette.bg} ${palette.text} ${palette.border}`;
  }
  const dayColor = DAY_COLORS[course.day] || DAY_COLORS["MON"];
  return `${dayColor.bg} ${dayColor.text} ${dayColor.border}`;
}

// Cell interface
interface CellSlot {
  key: string;
  isCourse: boolean;
  colspan: number;
  slotIndex: number;
  course?: CourseEntry;
  hasOverlap?: boolean;
  isDuplicate?: boolean;
}

// HIGH-PERFORMANCE COMPUTED GRID LAYOUT MAP
// Calculates row layouts once per modelValue update instead of 60fps in render loop!
const rowLayouts = computed<Record<string, CellSlot[]>>(() => {
  const map: Record<string, CellSlot[]> = {};
  const coursesList = props.modelValue || [];

  for (const day of ALL_DAYS) {
    const dayCourses = coursesList
      .filter((c) => c.day === day)
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    const cells: CellSlot[] = [];
    let currentSlot = 0;

    for (const course of dayCourses) {
      const startSlot = getStartSlotIndex(course.start);
      const span = timeToColspan(course.start, course.end);

      // Empty slots before course
      if (startSlot > currentSlot) {
        for (let s = currentSlot; s < startSlot; s++) {
          cells.push({
            key: `empty-${day}-${s}`,
            isCourse: false,
            colspan: 1,
            slotIndex: s,
          });
        }
      }

      const actualStart = Math.max(currentSlot, startSlot);
      const actualEnd = Math.min(NUM_SLOTS, actualStart + span);
      const actualSpan = Math.max(1, actualEnd - actualStart);

      // Precalculate overlap & duplicate flags
      const cStart = timeToMinutes(course.start);
      const cEnd = timeToMinutes(course.end);
      const overlap = dayCourses.some((other) => {
        if (other.id ? other.id === course.id : other === course) return false;
        const oStart = timeToMinutes(other.start);
        const oEnd = timeToMinutes(other.end);
        return Math.max(cStart, oStart) < Math.min(cEnd, oEnd);
      });

      const duplicate = coursesList.some(
        (other) => (other.id ? other.id !== course.id : other !== course) && isSameCourseDetails(other, course)
      );

      cells.push({
        key: `course-${course.id || course.code}-${actualStart}`,
        isCourse: true,
        colspan: actualSpan,
        slotIndex: actualStart,
        course,
        hasOverlap: overlap,
        isDuplicate: duplicate,
      });

      currentSlot = actualStart + actualSpan;
    }

    // Trailing empty slots
    for (let s = currentSlot; s < NUM_SLOTS; s++) {
      cells.push({
        key: `empty-${day}-${s}`,
        isCourse: false,
        colspan: 1,
        slotIndex: s,
      });
    }

    map[day] = cells;
  }

  return map;
});

// HTML5 Drag & Drop Handlers (OPTIMIZED)
function onCourseDragStart(e: DragEvent, course: CourseEntry) {
  if (!course.id) course.id = generateCourseId();
  activeDragCourseId.value = course.id;
  draggedCourseRef.value = course;

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", course.id);
  }
}

function onCourseDragEnd() {
  activeDragCourseId.value = null;
  draggedCourseRef.value = null;
  dropTargetSlot.value = null;
}

// BLAZING FAST SLOT HOVER: Only mutate reactive state if target slot actually changes!
function onSlotDragOver(e: DragEvent, day: string, slotIndex: number) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }

  if (
    !dropTargetSlot.value ||
    dropTargetSlot.value.day !== day ||
    dropTargetSlot.value.slotIndex !== slotIndex
  ) {
    dropTargetSlot.value = { day, slotIndex };
  }
}

function onSlotDragLeave() {
  // Retain active target until drop or end
}

function onSlotDrop(e: DragEvent, day: string, slotIndex: number) {
  e.preventDefault();
  dropTargetSlot.value = null;

  const draggedCourse = draggedCourseRef.value || props.modelValue.find((c) => c.id === activeDragCourseId.value);
  if (!draggedCourse) return;

  const origDurationMins = Math.max(
    15,
    timeToMinutes(draggedCourse.end) - timeToMinutes(draggedCourse.start)
  );

  const newStart = TIME_SLOTS[slotIndex];
  const newEnd = minutesToTime(timeToMinutes(newStart) + origDurationMins);

  const updatedList = (props.modelValue || []).map((c) => {
    if (c.id && c.id === draggedCourse.id) {
      return {
        ...c,
        day,
        start: newStart,
        end: newEnd,
      };
    }
    return c;
  });

  if (!props.modelValue.some((c) => c.id === draggedCourse.id)) {
    updatedList.push({
      ...draggedCourse,
      id: generateCourseId(),
      day,
      start: newStart,
      end: newEnd,
    });
  }

  emit("update:modelValue", updatedList);
  activeDragCourseId.value = null;
  draggedCourseRef.value = null;
}

// Slot Click Handler
function onSlotClick(day: string, slotIndex: number, isCourse: boolean) {
  if (isCourse) return;
  const startStr = TIME_SLOTS[slotIndex];
  const endStr = minutesToTime(timeToMinutes(startStr) + 60);

  editingCourse.value = {
    id: generateCourseId(),
    day,
    start: startStr,
    end: endStr,
    code: "",
    title: "",
    room: "",
    type: "Lecture",
    section: "1",
    credits: 3,
    color: "Default (Day Based)",
  };
  isNewCourse.value = true;
}

function openEditModal(course: CourseEntry) {
  editingCourse.value = { ...course };
  isNewCourse.value = false;
}

function closeModal() {
  editingCourse.value = null;
  isNewCourse.value = false;
}

function duplicateCourse(course: CourseEntry) {
  const copy: CourseEntry = {
    ...course,
    id: generateCourseId(),
  };
  const updated = [...(props.modelValue || []), copy];
  emit("update:modelValue", updated);
}

function saveCourse() {
  if (!editingCourse.value) return;
  const course = editingCourse.value;

  if (!course.code.trim() || !course.title.trim()) {
    alert("Please provide at least a course code and title.");
    return;
  }

  const updated = [...(props.modelValue || [])];
  if (isNewCourse.value) {
    updated.push({ ...course, id: course.id || generateCourseId() });
  } else {
    const idx = updated.findIndex((c) => c.id === course.id);
    if (idx !== -1) {
      updated[idx] = { ...course };
    } else {
      updated.push({ ...course });
    }
  }

  emit("update:modelValue", updated);
  closeModal();
}

function removeCourse(course: CourseEntry) {
  const updated = (props.modelValue || []).filter(
    (c) => (c.id ? c.id !== course.id : c !== course)
  );
  emit("update:modelValue", updated);
}

// SMOOTH POINTER RESIZING (rAF throttle)
let isResizing = false;
let resizingCourse: CourseEntry | null = null;
let startX = 0;
let initialEndMins = 0;
let rafId: number | null = null;

function startResizing(e: PointerEvent, course: CourseEntry) {
  isResizing = true;
  resizingCourse = course;
  startX = e.clientX;
  initialEndMins = timeToMinutes(course.end);

  window.addEventListener("pointermove", handleResizePointerMove);
  window.addEventListener("pointerup", handleResizeEnd);
}

function handleResizePointerMove(e: PointerEvent) {
  if (!isResizing || !resizingCourse) return;
  if (rafId) cancelAnimationFrame(rafId);

  const clientX = e.clientX;
  rafId = requestAnimationFrame(() => {
    if (!resizingCourse) return;
    const deltaX = clientX - startX;
    const slotsDelta = Math.round(deltaX / 22);
    const newEndMins = Math.max(
      timeToMinutes(resizingCourse.start) + 15,
      Math.min(20 * 60, initialEndMins + slotsDelta * 15)
    );

    const newEndTime = minutesToTime(newEndMins);
    if (newEndTime !== resizingCourse.end) {
      resizingCourse.end = newEndTime;
      const updated = (props.modelValue || []).map((c) =>
        c.id === resizingCourse?.id ? { ...c, end: newEndTime } : c
      );
      emit("update:modelValue", updated);
    }
  });
}

function handleResizeEnd() {
  isResizing = false;
  resizingCourse = null;
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener("pointermove", handleResizePointerMove);
  window.removeEventListener("pointerup", handleResizeEnd);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #090d16;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>
