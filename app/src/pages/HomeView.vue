<template>
  <div class="bg-slate-700 min-h-screen">
    <div class="px-[12vh] py-8">
      <h1 class="text-6xl font-extrabold text-center mb-8 bg-gradient-to-r from-sky-400 to-fuchsia-600 custom-text-gradient">Week Wizard</h1>
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

<style scoped>
.custom-text-gradient {
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>