<script setup lang="ts">
// KU HTML Guide component
// Purpose: Provide reusable instructions on how to obtain and paste KU timetable HTML
// Usage:
// <KuHtmlGuide />
//
// Optionally, you can pass a `compact` prop to reduce spacing.
// <KuHtmlGuide :compact="true" />
defineProps<{
  compact?: boolean;
}>();
</script>

<template>
  <div
    class="text-slate-200 bg-slate-800/60 border border-slate-600 rounded-lg"
    :class="compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'"
  >
    <div class="font-semibold mb-2">How to get KU table HTML</div>
    <ol class="list-decimal list-inside space-y-1">
      <li>Open your KU timetable page in the browser.</li>
      <li>
        Right-click on the timetable and choose “View Page Source” or use the
        Developer Tools (F12).
      </li>
      <li>
        Locate and copy the HTML of the table element that contains your
        schedule (including rows and cells).
      </li>
      <li>
        Paste that HTML into the input field provided, then click “Import table
        data from HTML”.
      </li>
    </ol>

    <div class="mt-3 opacity-80">
      Tip: Ensure the table includes day, time, code, title, room, type, and
      section data. If you’re unsure, try selecting the table element directly
      in the Elements panel of Developer Tools and copying its outer HTML.
    </div>
  </div>
</template>

<style scoped>
/* No additional styles required beyond Tailwind classes,
   but you can tweak spacing here if needed. */
</style>
