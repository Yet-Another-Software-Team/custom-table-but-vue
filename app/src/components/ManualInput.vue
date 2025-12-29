<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Added Course List Block -->
        <div class="bg-slate-700 rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-slate-300">Added Courses</h2>

                <div class="flex items-center gap-2">
                    <button
                        @click="emits('open-json-modal')"
                        class="text-xs bg-cyan-500 text-white font-semibold rounded-md px-3 py-1 shadow hover:bg-cyan-600 transition-colors"
                        title="Import/Export JSON"
                    >
                        JSON
                    </button>

                    <button
                        @click="emits('open-html-modal')"
                        class="text-xs bg-emerald-500 text-white font-semibold rounded-md px-3 py-1 shadow hover:bg-emerald-600 transition-colors"
                        title="Import from KU HTML"
                    >
                        KU HTML
                    </button>
                </div>
            </div>

            <div
                v-if="courses.length === 0"
                class="text-slate-400 text-center py-8"
            >
                No courses added yet.
            </div>
            <div v-else class="space-y-2">
                <div
                    v-for="(course, index) in courses"
                    :key="index"
                    class="flex items-center justify-between bg-slate-600 rounded-lg p-3 text-sm transition-transform transform hover:scale-[1.02] hover:bg-slate-500"
                >
                    <span class="font-medium text-slate-100">
                        <span class="font-bold">{{ course.day }}</span
                        >: {{ course.title }} ({{ course.code }})
                    </span>
                    <div class="flex items-center space-x-2">
                        <button
                            @click="editCourse(index)"
                            class="text-yellow-400 hover:text-yellow-500 focus:outline-none"
                            title="Edit Course"
                        >
                            <Icon icon="ic:baseline-edit" />
                        </button>
                        <button
                            @click="removeCourse(index)"
                            class="text-red-400 hover:text-red-500 focus:outline-none"
                            title="Remove Course"
                        >
                            <Icon icon="ic:baseline-delete" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Course Creation and Edit Form -->
        <div class="bg-slate-700 rounded-xl p-4 shadow-lg md:col-span-2">
            <h2 class="text-xl font-bold text-slate-300 mb-4">
                {{ editingIndex === -1 ? "Add New Course" : "Edit Course" }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label
                        for="day"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Day</label
                    >
                    <select
                        id="day"
                        v-model="newCourse.day"
                        class="w-full bg-slate-600 text-slate-100 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        <option value="" disabled>Select Day</option>
                        <option v-for="day in days" :key="day" :value="day">
                            {{ day }}
                        </option>
                    </select>
                </div>

                <div></div>

                <div class="flex flex-col">
                    <label
                        for="start"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Start Time</label
                    >
                    <select
                        id="start"
                        v-model="newCourse.start"
                        class="w-full bg-slate-600 text-slate-100 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        <option value="" disabled>Select Start Time</option>
                        <option
                            v-for="time in startTimes"
                            :key="time"
                            :value="time"
                        >
                            {{ time }}
                        </option>
                    </select>
                </div>

                <div class="flex flex-col">
                    <label
                        for="end"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >End Time</label
                    >
                    <select
                        id="end"
                        v-model="newCourse.end"
                        class="w-full bg-slate-600 text-slate-100 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        <option value="" disabled>Select End Time</option>
                        <option
                            v-for="time in filteredEndTimes"
                            :key="time"
                            :value="time"
                        >
                            {{ time }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <label
                        for="code"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Course Code</label
                    >
                    <input
                        id="code"
                        v-model="newCourse.code"
                        type="text"
                        placeholder="e.g., 01219366-65"
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div></div>

                <div class="flex flex-col md:col-span-2">
                    <label
                        for="title"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Course Title</label
                    >
                    <input
                        id="title"
                        v-model="newCourse.title"
                        type="text"
                        placeholder="e.g., Knowledge Engineering"
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div class="flex flex-col">
                    <label
                        for="room"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Room</label
                    >
                    <input
                        id="room"
                        v-model="newCourse.room"
                        type="text"
                        placeholder="e.g., E11-S603"
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div class="flex flex-col">
                    <label
                        for="type"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Type</label
                    >
                    <select
                        id="type"
                        v-model="newCourse.type"
                        class="w-full bg-slate-600 text-slate-100 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        <option value="" disabled>Select Type</option>
                        <option v-for="type in types" :key="type" :value="type">
                            {{ type }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <label
                        for="section"
                        class="text-sm font-medium text-slate-300 mb-1"
                        >Section</label
                    >
                    <input
                        id="section"
                        v-model="newCourse.section"
                        type="text"
                        placeholder="e.g., 450"
                        class="w-full bg-slate-600 text-slate-100 placeholder-slate-400 border-2 border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
            </div>
            <button
                @click="editingIndex === -1 ? addCourse() : updateCourse()"
                class="w-full bg-cyan-500 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-cyan-600 transition-colors duration-200 mt-4"
            >
                {{ editingIndex === -1 ? "Add Course" : "Update Course" }}
            </button>
            <button
                v-if="editingIndex !== -1"
                @click="cancelEdit()"
                class="w-full bg-slate-600 text-slate-200 font-bold rounded-xl px-6 py-3 shadow-lg hover:bg-slate-500 transition-colors duration-200 mt-2"
            >
                Cancel Edit
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { Icon } from "@iconify/vue";

// Pre-defined options for dropdowns
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const types = ["Lecture", "Laboratory", "Seminar"];

const generateTimeOptions = (startHour, endHour) => {
    const times = [];
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === endHour && m > 0) continue;
            const hour = h.toString().padStart(2, "0");
            const minute = m.toString().padStart(2, "0");
            times.push(`${hour}:${minute}`);
        }
    }
    return times;
};

const startTimes = generateTimeOptions(8, 20);

// Use defineProps to receive the 'modelValue' prop from the parent
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [],
    },
});

// Use defineEmits to declare the 'update:modelValue' event

const emits = defineEmits([
    "update:modelValue",
    "open-json-modal",
    "open-html-modal",
]);

// Local state to manage the courses, initialized with the prop value
const courses = ref([]);
const newCourse = ref({
    day: "",
    start: "",
    end: "",
    code: "",
    title: "",
    room: "",
    type: "",
    section: "",
});
const copySuccess = ref(false);
const editingIndex = ref(-1);

watch(
    () => props.modelValue,
    (newVal) => {
        courses.value = Array.isArray(newVal) ? [...newVal] : [];
    },
    { immediate: true },
);

watch(
    courses,
    (newVal) => {
        emits("update:modelValue", newVal);
    },
    { deep: true },
);

const filteredEndTimes = computed(() => {
    const startIndex = startTimes.indexOf(newCourse.value.start);
    if (startIndex === -1) {
        return [];
    }
    return startTimes.slice(startIndex + 1);
});

const addCourse = () => {
    const { day, start, end, code, title, room, type, section } =
        newCourse.value;
    if (day && start && end && code && title && room && type && section) {
        courses.value = [...courses.value, { ...newCourse.value }];
        newCourse.value = {
            day: "",
            start: "",
            end: "",
            code: "",
            title: "",
            room: "",
            type: "",
            section: "",
        };
    } else {
        alert("Please fill out all the fields before adding a course.");
    }
};

const editCourse = (index) => {
    editingIndex.value = index;
    const courseToEdit = courses.value[index];
    newCourse.value = { ...courseToEdit };
};

const updateCourse = () => {
    const { day, start, end, code, title, room, type, section } =
        newCourse.value;
    if (day && start && end && code && title && room && type && section) {
        // Create a new array instance with the updated item to ensure change detection
        const updated = [...courses.value];
        updated[editingIndex.value] = { ...newCourse.value };
        courses.value = updated;
        cancelEdit();
    } else {
        alert("Please fill out all the fields before updating a course.");
    }
};

const cancelEdit = () => {
    editingIndex.value = -1;
    newCourse.value = {
        day: "",
        start: "",
        end: "",
        code: "",
        title: "",
        room: "",
        type: "",
        section: "",
    };
};

// Function to remove a course from the courses array by its index
const removeCourse = (index) => {
    courses.value = courses.value.filter((_, i) => i !== index);
};
</script>
