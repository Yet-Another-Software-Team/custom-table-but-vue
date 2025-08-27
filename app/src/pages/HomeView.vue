<template>
  <div>
    <span>{{courses}}</span>
    <ManualInput v-model="courses" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ManualInput from '../components/ManualInput.vue';

const courses = ref([]);
</script>