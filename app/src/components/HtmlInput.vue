<script setup lang="ts">
import { ref, watch } from "vue";
import { parseHtmlToJson } from "../functions/parser";
import KuHtmlGuide from "./KuHtmlGuide.vue";

// Props: courses via v-model and modal visibility
const props = defineProps<{
    modelValue: Array<any>;
    show?: boolean;
}>();

// Emits: update courses and close modal
const emit = defineEmits<{
    (e: "update:modelValue", value: typeof props.modelValue): void;
    (e: "close"): void;
}>();

// Local mirrored state
const courses = ref<typeof props.modelValue>([]);
const message = ref<string>("");
const errorText = ref<string>("");
const showInfo = ref<boolean>(false);

// Mirror prop -> local
watch(
    () => props.modelValue,
    (newVal) => {
        courses.value = Array.isArray(newVal) ? [...newVal] : [];
    },
    { immediate: true },
);

// Mirror local -> emit
watch(
    courses,
    (newVal) => {
        emit("update:modelValue", newVal);
    },
    { deep: true },
);

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
        courses.value = parsed;
    } catch (e: any) {
        errorText.value = `Failed to parse HTML: ${e?.message || "Unknown error"}`;
    }
}

function closeModal() {
    emit("close");
}
</script>

<template>
    <div v-if="props.show" class="fixed inset-0 z-50">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60" @click="closeModal"></div>

        <!-- Modal container -->
        <div class="absolute inset-0 flex items-center justify-center p-4">
            <div class="bg-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl">
                <!-- Header -->
                <div
                    class="flex items-center justify-between p-4 border-b border-slate-600"
                >
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-bold text-slate-300">
                            KU Table HTML Input
                        </h2>
                        <button
                            @click="showInfo = !showInfo"
                            class="text-slate-300 hover:text-white bg-slate-600 hover:bg-slate-500 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            aria-label="Info"
                            title="Instructions"
                        >
                            i
                        </button>
                    </div>
                    <button
                        @click="closeModal"
                        class="text-slate-300 hover:text-white bg-slate-600 hover:bg-slate-500 rounded-full w-8 h-8 flex items-center justify-center"
                        aria-label="Close"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <div class="p-4 space-y-3">
                    <KuHtmlGuide v-if="showInfo" />

                    <textarea
                        v-model="message"
                        rows="10"
                        placeholder="Paste KU table HTML here"
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm"
                    />

                    <div
                        v-if="errorText"
                        class="text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2"
                    >
                        {{ errorText }}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            @click="parseInput"
                            class="w-full bg-emerald-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-emerald-600 transition-colors duration-200"
                        >
                            Import table data from HTML
                        </button>
                        <button
                            @click="closeModal"
                            class="w-full bg-slate-600 text-slate-200 font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-slate-500 transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>

                    <div class="mt-2 text-slate-300 text-sm">
                        Current courses:
                        <span class="font-semibold">{{ courses.length }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
