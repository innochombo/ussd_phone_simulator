<script setup lang="ts">
import { computed } from 'vue'
import UssdScreen from './UssdScreen.vue'
import InputBar from './InputBar.vue'
import { useSettingsStore } from '@/stores/settings'
import { SKINS } from '@/types/skins'

const settings = useSettingsStore()
const skin = computed(() => SKINS[settings.skin])
</script>

<template>
  <div
    class="mx-auto w-full max-w-[340px] rounded-[2.5rem] shadow-2xl shadow-black/40 p-4 flex flex-col gap-0 select-none transition-colors duration-300"
    :class="skin.body"
  >
    <!-- Speaker grille -->
    <div class="flex justify-center mb-3">
      <div class="w-16 h-1.5 rounded-full transition-colors duration-300" :class="skin.grille" />
    </div>

    <!-- Screen bezel -->
    <div class="rounded-2xl overflow-hidden p-1 transition-colors duration-300" :class="skin.bezel">
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
      <div class="w-24 h-1 rounded-full transition-colors duration-300" :class="skin.indicator" />
    </div>
  </div>
</template>
