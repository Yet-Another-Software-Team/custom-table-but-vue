<template>
  <div>
    <span>{{courses}}</span>
    <ScheduleTable :modelValue="courses" />
    <ManualInput v-model="courses" />
    <HtmlInput v-model="courses"/>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ManualInput from '../components/ManualInput.vue';
import ScheduleTable from '../components/ScheduleTable.vue';
import HtmlInput from '../components/HtmlInput.vue';

const courses = ref([]);
</script>