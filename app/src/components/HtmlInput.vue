<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { parseHtmlToJson } from "../functions/parser";
import KuHtmlGuide from "./KuHtmlGuide.vue";
import type { CourseEntry } from "../functions/gen-schedule-helper";

const props = defineProps<{
  modelValue: CourseEntry[];
  show?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CourseEntry[]): void;
  (e: "close"): void;
}>();

const message = ref<string>("");
const errorText = ref<string>("");
const showInfo = ref<boolean>(false);

function parseInput() {
  errorText.value = "";
  try {
    const jsonStr = parseHtmlToJson(message.value);
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      errorText.value =
        "Parsed result is not an array. Ensure the HTML contains valid KU table data.";
      return;
    }
    emit("update:modelValue", parsed);
    emit("close");
  } catch (e: any) {
    errorText.value = `Failed to parse HTML: ${e?.message || "Unknown error"}`;
  }
}

function closeModal() {
  emit("close");
}

const courseCount = computed(() => (props.modelValue || []).length);
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
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Icon icon="ic:baseline-code" class="w-5 h-5 text-emerald-400" />
              <span>KU Table HTML Input</span>
            </h2>
            <button
              @click="showInfo = !showInfo"
              class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs"
              aria-label="Info"
              title="Instructions"
            >
              <Icon icon="ic:baseline-info" class="w-4 h-4" />
            </button>
          </div>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="p-5 space-y-4">
          <KuHtmlGuide v-if="showInfo" />

          <textarea
            v-model="message"
            rows="10"
            placeholder="Paste raw KU timetable HTML code here..."
            class="w-full bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors font-mono text-xs"
          />

          <div
            v-if="errorText"
            class="text-rose-300 bg-rose-950/50 border border-rose-800 rounded-xl px-3.5 py-2.5 text-xs font-mono flex items-center gap-2"
          >
            <Icon icon="ic:baseline-error" class="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{{ errorText }}</span>
          </div>

          <div class="flex items-center justify-between gap-3 pt-2">
            <div class="text-slate-400 text-xs">
              Current active courses: <span class="font-bold text-cyan-400">{{ courseCount }}</span>
            </div>

            <div class="flex gap-2.5">
              <button
                @click="closeModal"
                class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                @click="parseInput"
                class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ic:baseline-file-upload" class="w-4 h-4" />
                Import Table Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
