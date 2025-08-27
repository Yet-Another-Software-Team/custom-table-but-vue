<script setup lang="ts">
import { ref, watch } from "vue";
import { parseHtmlToJson } from "../functions/parser";


// Use defineProps to receive the 'modelValue' prop from the parent
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  }
});

// Use defineEmits to declare the 'update:modelValue' event
const emits = defineEmits(['update:modelValue']);

// Local state to manage the courses, initialized with the prop value
const courses = ref([]);

watch(() => props.modelValue, (newVal) => {
  courses.value = newVal;
}, { immediate: true });

watch(courses, (newVal) => {
  emits('update:modelValue', newVal);
}, { deep: true });
const message = ref("");


function parseInput() {
    courses.value = JSON.parse(parseHtmlToJson(message.value))
}
</script>

<template>
  <div class="w-full py-4">
    <div class="bg-slate-700 rounded-xl p-4 shadow-lg">
      <h2 class="text-xl font-bold text-slate-300">KU Table HTML Input</h2>
      <input
        v-model="message"
        placeholder="your html here"
        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 
                rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      <button
        @click="parseInput"
        class="w-full bg-emerald-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg 
                hover:bg-emerald-600 transition-colors duration-200"
        >
        Import table data from HTML
      </button>
    </div>
  </div>
</template>