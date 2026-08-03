<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Icon } from "@iconify/vue";
import type { CourseEntry } from "../functions/gen-schedule-helper";

const props = defineProps<{
  modelValue: CourseEntry[];
  show?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CourseEntry[]): void;
  (e: "close"): void;
}>();

const jsonText = ref<string>("");
const errorText = ref<string>("");

// Automatically populate jsonText when modal is opened
watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      jsonText.value = JSON.stringify(props.modelValue || [], null, 2);
      errorText.value = "";
    }
  }
);

function isValidCourseEntry(entry: any): boolean {
  return (
    entry &&
    typeof entry.day === "string" &&
    typeof entry.start === "string" &&
    typeof entry.end === "string" &&
    typeof entry.code === "string" &&
    typeof entry.title === "string"
  );
}

function validateCoursesArray(arr: any): arr is CourseEntry[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(isValidCourseEntry);
}

function importJson() {
  errorText.value = "";
  try {
    const parsed = JSON.parse(jsonText.value.trim());
    if (!validateCoursesArray(parsed)) {
      errorText.value =
        "Invalid JSON format. Expect an array of course objects with at least: day, start, end, code, title.";
      return;
    }
    emit("update:modelValue", parsed);
    emit("close");
  } catch (e: any) {
    errorText.value = `Failed to parse JSON: ${e?.message || "Unknown error"}`;
  }
}

async function copyToClipboard() {
  errorText.value = "";
  try {
    if (!jsonText.value.trim()) {
      jsonText.value = JSON.stringify(props.modelValue || [], null, 2);
    }
    await navigator.clipboard.writeText(jsonText.value);
    alert("JSON copied to clipboard!");
  } catch (e: any) {
    errorText.value = `Clipboard copy failed: ${e?.message || "Unknown error"}`;
  }
}

function downloadJson() {
  errorText.value = "";
  try {
    const data =
      jsonText.value.trim() || JSON.stringify(props.modelValue || [], null, 2);
    const blob = new Blob([data], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
    a.href = url;
    a.download = `courses_${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e: any) {
    errorText.value = `Download failed: ${e?.message || "Unknown error"}`;
  }
}

function closeModal() {
  emit("close");
}

const currentCourseCount = computed(() => (props.modelValue || []).length);
</script>

<template>
  <div v-if="props.show" class="fixed inset-0 z-50">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" @click="closeModal"></div>

    <!-- Modal container -->
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Icon icon="ic:baseline-save" class="w-5 h-5 text-indigo-400" />
            <span>Import / Export JSON</span>
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4">
          <textarea
            v-model="jsonText"
            rows="10"
            placeholder='Paste JSON here (e.g., [{"day":"MON","start":"09:00",...}])'
            class="w-full bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors font-mono text-xs"
          />

          <div
            v-if="errorText"
            class="text-rose-300 bg-rose-950/50 border border-rose-800 rounded-xl px-3.5 py-2.5 text-xs font-mono flex items-center gap-2"
          >
            <Icon icon="ic:baseline-error" class="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{{ errorText }}</span>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="text-slate-400 text-xs">
              Current active courses: <span class="font-bold text-cyan-400">{{ currentCourseCount }}</span>
            </div>

            <div class="flex flex-wrap gap-2.5">
              <button
                @click="importJson"
                class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl px-5 py-2.5 text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ic:baseline-file-upload" class="w-4 h-4" />
                Import JSON
              </button>

              <button
                @click="copyToClipboard"
                class="bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ic:baseline-content-copy" class="w-4 h-4" />
                Copy to Clipboard
              </button>

              <button
                @click="downloadJson"
                class="bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ic:baseline-file-download" class="w-4 h-4" />
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
