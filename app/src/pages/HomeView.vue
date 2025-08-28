<template>
  <div class="bg-slate-700 min-h-screen">
    <div class="px-[12vh] py-8">
      <h1 class="text-white text-4xl font-bold text-center mb-8">Week Wizard</h1>
      <div class="bg-slate-800 rounded-lg shadow-xl p-6">
        <ScheduleTable :modelValue="courses" />
      </div>
      <div class="mt-8">
        <div class="bg-slate-800 rounded-lg shadow-xl p-6 mb-6">
          <ManualInput v-model="courses" />
        </div>
        <div class="bg-slate-800 rounded-lg shadow-xl p-6">
          <HtmlInput v-model="courses" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ManualInput from '../components/ManualInput.vue';
import ScheduleTable from '../components/ScheduleTable.vue';
import HtmlInput from '../components/HtmlInput.vue';

const courses = ref([]);
</script>