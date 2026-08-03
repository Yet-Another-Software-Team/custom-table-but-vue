<template>
  <div class="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6 text-slate-100">
    <!-- Top Action & Tools Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
      <!-- Left: Header & Quick Stats -->
      <div class="space-y-1">
        <h2 class="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <Icon icon="ic:baseline-dashboard" class="w-5 h-5 text-cyan-400 inline" />
          <span>Course Manager</span>
        </h2>
        <p class="text-xs text-slate-400">
          Manage your schedule visually. Click any cell on the grid or add courses below!
        </p>
      </div>

      <!-- Right: Action Buttons with Iconify Icons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Toggle Sunday Button -->
        <button
          @click="toggleSunday"
          :class="[
            'flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all',
            includeSunday
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          ]"
          title="Toggle Sunday column visibility"
        >
          <Icon icon="ic:baseline-today" class="w-4 h-4" />
          <span>{{ includeSunday ? 'Sunday Enabled' : 'Hide Sunday' }}</span>
        </button>

        <button
          @click="openAddModal"
          class="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Icon icon="ic:baseline-add-circle" class="w-4 h-4" />
          <span>Add Course</span>
        </button>

        <button
          @click="emits('open-html-modal')"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
          title="Import schedule from KU HTML"
        >
          <Icon icon="ic:baseline-code" class="w-4 h-4" />
          <span>KU HTML Import</span>
        </button>

        <button
          @click="emits('open-json-modal')"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all"
          title="Import or Export JSON data"
        >
          <Icon icon="ic:baseline-save" class="w-4 h-4" />
          <span>JSON I/O</span>
        </button>

        <button
          v-if="courses.length > 0"
          @click="confirmClearAll"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
          title="Clear all courses"
        >
          <Icon icon="ic:baseline-delete-forever" class="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards with Icons -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          <Icon icon="ic:baseline-book" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Courses</div>
          <div class="text-xl font-extrabold text-slate-100">{{ courses.length }}</div>
        </div>
      </div>

      <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <Icon icon="ic:baseline-school" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Credits</div>
          <div class="text-xl font-extrabold text-slate-100">{{ totalCredits }} cr</div>
        </div>
      </div>

      <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <Icon icon="ic:baseline-access-time" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weekly Hours</div>
          <div class="text-xl font-extrabold text-slate-100">{{ totalWeeklyHours }} hrs</div>
        </div>
      </div>

      <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <Icon icon="ic:baseline-warning" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conflicts</div>
          <div :class="['text-xl font-extrabold', conflictCount > 0 ? 'text-rose-400' : 'text-slate-100']">
            {{ conflictCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Courses Cards List -->
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Icon icon="ic:baseline-list-alt" class="w-4 h-4 text-cyan-400" />
          <span>Active Course List</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
            {{ courses.length }}
          </span>
        </h3>
        <span class="text-xs text-slate-400">Click any course on grid or list to edit</span>
      </div>

      <div v-if="courses.length === 0" class="py-12 text-center text-slate-500 space-y-2">
        <Icon icon="ic:baseline-event-busy" class="w-10 h-10 mx-auto text-slate-600" />
        <div class="text-sm font-medium">No courses in schedule yet</div>
        <div class="text-xs text-slate-400">
          Click any slot on the grid or import HTML/JSON to get started!
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-for="(course, index) in courses"
          :key="course.id || index"
          class="p-3.5 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700/70 transition-all flex items-center justify-between group shadow-sm"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <div
              :class="[
                'w-2 h-10 rounded-full flex-shrink-0',
                getDayColorBadge(course.day)
              ]"
            ></div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-cyan-400 font-mono">{{ course.day }}</span>
                <span class="text-[11px] text-slate-400 font-mono">
                  {{ course.start }}-{{ course.end }}
                </span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 font-mono text-slate-300">
                  {{ course.credits || 3 }}cr
                </span>
              </div>
              <div class="text-xs font-bold text-slate-100 truncate mt-0.5">
                {{ course.title || course.code }}
              </div>
              <div class="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <span>{{ course.code }}</span>
                <span>•</span>
                <span class="flex items-center gap-0.5">
                  <Icon icon="ic:baseline-location-on" class="w-3 h-3" />
                  {{ course.room || 'TBA' }}
                </span>
                <span>(Sec {{ course.section }})</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              @click="duplicateCourse(course)"
              class="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              title="Duplicate Course"
            >
              <Icon icon="ic:baseline-content-copy" class="w-4 h-4" />
            </button>
            <button
              @click="removeCourse(index)"
              class="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              title="Delete course"
            >
              <Icon icon="ic:baseline-delete" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import {
  DAY_COLORS,
  timeToMinutes,
  generateCourseId,
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

const emits = defineEmits<{
  (e: "update:modelValue", courses: CourseEntry[]): void;
  (e: "update:includeSunday", value: boolean): void;
  (e: "open-json-modal"): void;
  (e: "open-html-modal"): void;
}>();

// Writable computed to prevent infinite reactivity watcher loop
const courses = computed<CourseEntry[]>({
  get: () => props.modelValue || [],
  set: (val) => emits("update:modelValue", val),
});

function toggleSunday() {
  emits("update:includeSunday", !props.includeSunday);
}

// Stats Computations
const totalCredits = computed(() => {
  return courses.value.reduce((acc, c) => acc + (c.credits || 3), 0);
});

const totalWeeklyHours = computed(() => {
  let totalMins = 0;
  for (const c of courses.value) {
    const startMins = timeToMinutes(c.start);
    const endMins = timeToMinutes(c.end);
    if (endMins > startMins) totalMins += endMins - startMins;
  }
  return (totalMins / 60).toFixed(1);
});

const conflictCount = computed(() => {
  let conflicts = 0;
  for (let i = 0; i < courses.value.length; i++) {
    for (let j = i + 1; j < courses.value.length; j++) {
      const c1 = courses.value[i];
      const c2 = courses.value[j];
      if (c1.day === c2.day) {
        const s1 = timeToMinutes(c1.start);
        const e1 = timeToMinutes(c1.end);
        const s2 = timeToMinutes(c2.start);
        const e2 = timeToMinutes(c2.end);
        if (Math.max(s1, s2) < Math.min(e1, e2)) conflicts++;
      }
    }
  }
  return conflicts;
});

function getDayColorBadge(day: string): string {
  const dayColor = DAY_COLORS[day];
  return dayColor ? dayColor.bg : "bg-slate-500";
}

function openAddModal() {
  const defaultNew: CourseEntry = {
    id: generateCourseId(),
    day: "MON",
    start: "09:00",
    end: "10:30",
    code: "NEW101",
    title: "New Course Title",
    room: "E11-603",
    type: "Lecture",
    section: "1",
    credits: 3,
    color: "Default (Day Based)",
  };
  courses.value = [...courses.value, defaultNew];
}

function duplicateCourse(course: CourseEntry) {
  const copy: CourseEntry = {
    ...course,
    id: generateCourseId(),
  };
  courses.value = [...courses.value, copy];
}

function removeCourse(index: number) {
  courses.value = courses.value.filter((_, i) => i !== index);
}

function confirmClearAll() {
  if (confirm("Are you sure you want to clear all courses from the schedule?")) {
    courses.value = [];
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f172a;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
</style>
