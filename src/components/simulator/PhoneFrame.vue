<script setup lang="ts">
import UssdScreen from './UssdScreen.vue'
import InputBar from './InputBar.vue'
</script>

<template>
  <div class="mx-auto w-[340px] rounded-[2.5rem] bg-gray-800 dark:bg-gray-950 shadow-2xl shadow-black/40 p-4 flex flex-col gap-0 select-none">
    <!-- Speaker grille -->
    <div class="flex justify-center mb-3">
      <div class="w-16 h-1.5 rounded-full bg-gray-700 dark:bg-gray-800" />
    </div>

    <!-- Screen bezel -->
    <div class="rounded-2xl overflow-hidden bg-gray-900 p-1">
      <div class="rounded-xl overflow-hidden h-52">
        <UssdScreen />
      </div>
    </div>

    <!-- Body -->
    <div class="mt-4 px-1">
      <InputBar />
    </div>

    <!-- Home indicator -->
    <div class="flex justify-center mt-4">
      <div class="w-24 h-1 rounded-full bg-gray-700 dark:bg-gray-800" />
    </div>
  </div>
</template>
