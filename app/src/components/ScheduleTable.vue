<template>
    <div
        ref="scrollContainer"
        class="container mx-auto rounded-xl shadow-2xl bg-[#111622] border border-gray-800 overflow-x-auto responsive custom-scrollbar"
        style="font-size: 1em"
    >
        <div class="relative">
            <table class="border-collapse size-full" style="font-size: 1em">
                <colgroup>
                    <col style="width: 1.5em" />
                    <col
                        v-for="(slot, index) in TIME_SLOTS"
                        :key="'col-' + index"
                        style="width: 1.5em"
                    />
                </colgroup>
                <thead>
                    <tr
                        class="bg-[#111622] sticky top-0 z-20 border-b border-gray-800"
                    >
                        <th
                            class="sticky left-0 z-100 bg-[#111622] px-4 py-3 text-left font-semibold text-white rounded-tl-lg border-r border-gray-800"
                            style="height: 3em"
                        >
                            Day/Time
                        </th>
                        <th
                            v-for="(h, index) in HOURS_FOR_HEADER"
                            :key="h"
                            :colspan="2"
                            :class="[
                                'px-1 py-3 text-center text-gray-300 font-medium whitespace-nowrap border-r border-gray-800',
                                {
                                    'rounded-tr-lg':
                                        index === HOURS_FOR_HEADER.length - 1,
                                },
                            ]"
                            style="height: 3em"
                        >
                            {{ h }}:00
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(day, i) in DAYS"
                        :key="day"
                        style="height: 6.25em"
                    >
                        <td
                            :class="[
                                'sticky left-0 z-20 px-4 py-3 font-bold text-center text-neutral-900 border-r border-gray-800 whitespace-nowrap',
                                dayColors[day] ||
                                    'bg-gray-800 text-neutral-900',
                                i !== DAYS.length - 1
                                    ? 'border-b border-gray-800'
                                    : 'rounded-bl-lg',
                            ]"
                        >
                            {{ day }}
                        </td>
                        <!-- Each cell spans 1.5em wide (one 30-minute slot) -->
                        <td
                            v-for="(cell, cellIndex) in getRowCells(
                                day,
                                i === DAYS.length - 1,
                            )"
                            :key="cellIndex"
                            :colspan="cell.colspan"
                            :class="[
                                !cell.isLastRow
                                    ? 'border-b border-gray-800'
                                    : '',
                                'border-r border-gray-800 p-0',
                            ]"
                        >
                            <div
                                v-if="cell.type === 'empty'"
                                style="width: 100%; height: 100%"
                            ></div>
                            <div
                                v-else
                                v-html="cell.html"
                                style="
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                "
                            ></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                class="absolute text-right text-gray-400 select-none footer-credit"
                style="font-size: 0.75em; bottom: 0.5rem; right: 0.5rem"
            >
                created by
                <a
                    href="https://github.com/Yet-Another-Software-Team"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:cursor-pointer hover:text-blue-500"
                    >YAST</a
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    type PropType,
    ref,
    onMounted,
    onBeforeUnmount,
} from "vue";
import {
    timeToColspan,
    getStartSlotIndex,
    DAYS,
    TIME_SLOTS,
    HOURS_FOR_HEADER,
} from "../components/gen-schedule-helper.ts";

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
    name: "ScheduleTable",
    props: {
        modelValue: {
            type: Array as PropType<ClassEntry[]>,
            required: true,
        },
    },
    emits: ["update:modelValue"],
    setup(props) {
        const scrollContainer = ref<HTMLDivElement | null>(null);
        onMounted(() => {
            if (scrollContainer.value) {
                scrollContainer.value.addEventListener("scroll", handleScroll);
            }
        });

        onBeforeUnmount(() => {
            if (scrollContainer.value) {
                scrollContainer.value.removeEventListener(
                    "scroll",
                    handleScroll,
                );
            }
        });

        function handleScroll() {
            const footer = document.querySelector(
                ".footer-credit",
            ) as HTMLElement;
            if (footer && scrollContainer.value) {
                const scrollLeft = scrollContainer.value.scrollLeft;
                footer.style.transform = `translateX(${scrollLeft}px)`;
            }
        }

        const dayColors: Record<string, string> = {
            MON: "bg-yellow-400",
            TUE: "bg-pink-400",
            WED: "bg-green-400",
            THU: "bg-orange-400",
            FRI: "bg-blue-400",
            SAT: "bg-purple-400",
            SUN: "bg-red-400",
        };

        function genCell(cls: ClassEntry): {
            html: string;
            colspan: number;
            type: "class";
            isLastRow: boolean;
        } {
            const span = timeToColspan(cls.start, cls.end);
            const color = dayColors[cls.day] || "bg-gray-700 text-neutral-900";
            const html = `
        <div class="w-full h-full p-2 align-top ${color} text-neutral-900 rounded-lg overflow-hidden flex flex-col justify-center">
          <div class="leading-tight">
            <div class="font-semibold" style="font-size: 0.9em;">[${cls.start}-${cls.end}]</div>
            <div class="font-bold" style="font-size: 0.95em;">${cls.code}</div>
            <div style="font-size: 0.9em;">${cls.title}</div>
            <div class="opacity-90" style="font-size: 0.8em;">${cls.room} | ${cls.type} ${cls.section}</div>
          </div>
        </div>`;
            return { html, colspan: span, type: "class", isLastRow: false };
        }

        function getRowCells(day: string, isLastRow: boolean) {
            let slotPtr = 0;
            const sortedClasses = (props.modelValue ?? [])
                .filter((cls) => cls.day === day)
                .sort(
                    (a, b) =>
                        Date.parse(`1970-01-01T${a.start}:00`) -
                        Date.parse(`1970-01-01T${b.start}:00`),
                );
            const cells: Array<{
                type: "empty" | "class";
                colspan: number;
                html?: string;
                isLastRow: boolean;
            }> = [];
            for (const cls of sortedClasses) {
                const clsStartSlotIndex = getStartSlotIndex(cls.start.trim());
                const colspan = timeToColspan(cls.start, cls.end);
                const emptySlotsBefore = clsStartSlotIndex - slotPtr;
                if (emptySlotsBefore > 0) {
                    cells.push({
                        type: "empty",
                        colspan: emptySlotsBefore,
                        isLastRow,
                    });
                }
                slotPtr = clsStartSlotIndex;
                cells.push({ ...genCell(cls), isLastRow });
                slotPtr += colspan;
            }
            if (slotPtr < TIME_SLOTS.length) {
                cells.push({
                    type: "empty",
                    colspan: TIME_SLOTS.length - slotPtr,
                    isLastRow,
                });
            }
            return cells;
        }

        return {
            DAYS,
            TIME_SLOTS,
            HOURS_FOR_HEADER,
            dayColors,
            getRowCells,
            scrollContainer,
        };
    },
});
</script>

<style scoped>
/* Custom scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
    height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #1a1f2e;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #5a6573;
}

/* Firefox scrollbar */
.custom-scrollbar {
    scrollbar-color: #4b5563 #1a1f2e;
    scrollbar-width: thin;
}

/* Fixed footer credit */
.footer-credit {
    bottom: 0.5rem;
    right: 0.5rem;
}

/* Responsive font sizes */
@media (max-width: 1024px) {
    .responsive {
        font-size: 0.9em;
    }
}

@media (max-width: 768px) {
    .responsive {
        font-size: 0.8em;
    }
}

@media (max-width: 512px) {
    .responsive {
        font-size: 0.7em;
    }
}
</style>
