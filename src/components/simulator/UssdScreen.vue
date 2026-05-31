<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { computed } from 'vue'

const session = useSessionStore()

const lines = computed(() => session.currentText.split('\n'))

const statusClass = computed(() => {
  switch (session.status) {
    case 'DIALING': return 'text-yellow-600 dark:text-yellow-400'
    case 'ACTIVE': return 'text-green-800 dark:text-green-300'
    case 'END': return 'text-gray-500 dark:text-gray-400'
    case 'ERROR': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-400 dark:text-gray-500'
  }
})
</script>

<template>
  <div class="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm overflow-hidden">
    <!-- Status bar -->
    <div class="flex items-center justify-between mb-2 text-xs">
      <span class="text-gray-400 dark:text-gray-500">USSD</span>
      <span :class="statusClass" class="font-semibold uppercase tracking-wide">
        {{ session.status }}
      </span>
    </div>

    <!-- Screen text -->
    <div class="flex-1 overflow-y-auto">
      <template v-if="session.status === 'IDLE'">
        <p class="text-gray-400 dark:text-gray-600 italic text-center mt-6">
          Dial a USSD code to begin
        </p>
      </template>
      <template v-else-if="session.status === 'DIALING'">
        <p class="text-yellow-600 dark:text-yellow-400 text-center mt-6 animate-pulse">
          Connecting…
        </p>
      </template>
      <template v-else>
        <p
          v-for="(line, i) in lines"
          :key="i"
          class="leading-snug text-gray-900 dark:text-gray-100"
          :class="{ 'mb-1': i < lines.length - 1 }"
        >
          {{ line || ' ' }}
        </p>

        <span
          v-if="session.isLoading"
          class="inline-block w-2 h-4 bg-gray-700 dark:bg-gray-300 animate-pulse ml-1"
        />
      </template>
    </div>
  </div>
</template>
