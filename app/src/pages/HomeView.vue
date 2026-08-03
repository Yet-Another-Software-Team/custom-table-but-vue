<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
    <!-- Background Glow Effects -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      <!-- Header / Hero Section -->
      <header class="text-center space-y-3 pt-4">
        <h1 class="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
          Week Wizard
        </h1>
      </header>

      <!-- Main Schedule Grid Section -->
      <main class="space-y-8">
        <!-- Interactive Drag & Drop Schedule Table -->
        <section class="shadow-2xl">
          <ScheduleTable
            v-model="courses"
            :include-sunday="includeSunday"
          />
        </section>

        <!-- Course Control & Management Panel -->
        <section>
          <ManualInput
            v-model="courses"
            v-model:include-sunday="includeSunday"
            @open-json-modal="showJsonModal = true"
            @open-html-modal="showHtmlModal = true"
          />
        </section>
      </main>

      <!-- Modals -->
      <JsonIO
        v-model="courses"
        :show="showJsonModal"
        @close="showJsonModal = false"
      />
      <HtmlInput
        v-model="courses"
        :show="showHtmlModal"
        @close="showHtmlModal = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScheduleTable from "../components/ScheduleTable.vue";
import ManualInput from "../components/ManualInput.vue";
import HtmlInput from "../components/HtmlInput.vue";
import JsonIO from "../components/JsonIO.vue";
import type { CourseEntry } from "../functions/gen-schedule-helper";

// Include Sunday toggle state (defaults to false)
const includeSunday = ref(false);

// Initial sample courses with credits
const courses = ref<CourseEntry[]>([
  {
    id: "crs_sample_1",
    day: "MON",
    start: "09:00",
    end: "10:30",
    code: "01219366",
    title: "Software Engineering",
    room: "E11-S603",
    type: "Lecture",
    section: "1",
    credits: 3,
    color: "Default (Day Based)",
  },
  {
    id: "crs_sample_2",
    day: "WED",
    start: "13:00",
    end: "15:00",
    code: "01219213",
    title: "Data Structures & Algorithms",
    room: "E11-LAB2",
    type: "Laboratory",
    section: "450",
    credits: 3,
    color: "Default (Day Based)",
  },
  {
    id: "crs_sample_3",
    day: "FRI",
    start: "10:00",
    end: "12:00",
    code: "01204212",
    title: "Computer Networks",
    room: "E10-301",
    type: "Lecture",
    section: "1",
    credits: 3,
    color: "Default (Day Based)",
  },
]);

const showJsonModal = ref(false);
const showHtmlModal = ref(false);
</script>
