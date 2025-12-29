<script setup lang="ts">
import { ref, watch } from "vue";

// Props: courses array passed from parent via v-model, plus modal visibility

const props = defineProps<{
    modelValue: Array<{
        day: string;

        start: string;

        end: string;

        code: string;

        title: string;

        room: string;

        type: string;

        section: string;
    }>;

    show?: boolean; // controls modal visibility
}>();

// Emits: update parent courses and close modal
const emit = defineEmits<{
    (e: "update:modelValue", value: typeof props.modelValue): void;

    (e: "close"): void;
}>();

// Local reactive state mirrored from props

const courses = ref<typeof props.modelValue>([]);

const jsonText = ref<string>("");

const errorText = ref<string>("");

// Mirror prop -> local

watch(
    () => props.modelValue,

    (val) => {
        courses.value = Array.isArray(val) ? [...val] : [];
    },

    { immediate: true },
);

// Mirror local -> emit

watch(
    courses,

    (val) => {
        emit("update:modelValue", val);
    },

    { deep: true },
);

// Validate shape of a single course entry

function isValidCourseEntry(entry: any): boolean {
    return (
        entry &&
        typeof entry.day === "string" &&
        typeof entry.start === "string" &&
        typeof entry.end === "string" &&
        typeof entry.code === "string" &&
        typeof entry.title === "string" &&
        typeof entry.room === "string" &&
        typeof entry.type === "string" &&
        typeof entry.section === "string"
    );
}

// Validate array of courses

function validateCoursesArray(arr: any): arr is typeof props.modelValue {
    if (!Array.isArray(arr)) return false;

    return arr.every(isValidCourseEntry);
}

// Import from JSON textarea into courses

function importJson() {
    errorText.value = "";

    try {
        const parsed = JSON.parse(jsonText.value.trim());

        if (!validateCoursesArray(parsed)) {
            errorText.value =
                "Invalid JSON format. Expect an array of course objects with fields: day, start, end, code, title, room, type, section.";

            return;
        }

        courses.value = parsed;
    } catch (e: any) {
        errorText.value = `Failed to parse JSON: ${e?.message || "Unknown error"}`;
    }
}

// Export courses to JSON textarea

function exportJson() {
    errorText.value = "";

    jsonText.value = JSON.stringify(courses.value, null, 2);
}

// Copy JSON to clipboard

async function copyToClipboard() {
    errorText.value = "";

    try {
        if (!jsonText.value.trim()) {
            // If empty, export then copy

            exportJson();
        }

        await navigator.clipboard.writeText(jsonText.value);
    } catch (e: any) {
        errorText.value = `Clipboard copy failed: ${e?.message || "Unknown error"}`;
    }
}

// Download JSON as file

function downloadJson() {
    errorText.value = "";

    try {
        const data =
            jsonText.value.trim() || JSON.stringify(courses.value, null, 2);

        const blob = new Blob([data], {
            type: "application/json;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        const ts = new Date()

            .toISOString()

            .replace(/[:.]/g, "-")

            .replace("T", "_")

            .replace("Z", "");

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

// Close modal helpers
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
                    <h2 class="text-xl font-bold text-slate-300">
                        Import/Export JSON
                    </h2>

                    <button
                        @click="closeModal"
                        class="text-slate-300 hover:text-white bg-slate-600 hover:bg-slate-500 rounded-full w-8 h-8 flex items-center justify-center"
                        aria-label="Close"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <!-- Body -->
                <div class="p-4 space-y-3">
                    <textarea
                        v-model="jsonText"
                        rows="10"
                        placeholder='Paste JSON here (e.g., [{"day":"MON","start":"09:00",...}])'
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm"
                    />

                    <div
                        v-if="errorText"
                        class="text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2"
                    >
                        {{ errorText }}
                    </div>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                    >
                        <button
                            @click="importJson"
                            class="w-full bg-emerald-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-emerald-600 transition-colors duration-200"
                        >
                            Import JSON
                        </button>

                        <button
                            @click="exportJson"
                            class="w-full bg-cyan-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-cyan-600 transition-colors duration-200"
                        >
                            Export from Courses
                        </button>

                        <button
                            @click="copyToClipboard"
                            class="w-full bg-indigo-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-indigo-600 transition-colors duration-200"
                        >
                            Copy JSON
                        </button>

                        <button
                            @click="downloadJson"
                            class="w-full bg-fuchsia-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-fuchsia-600 transition-colors duration-200"
                        >
                            Download JSON
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
