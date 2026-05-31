<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { ref } from 'vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const logEl = ref<HTMLElement | null>(null)

watch(
  () => session.log.length,
  async () => {
    await nextTick()
    if (logEl.value) {
      logEl.value.scrollTop = logEl.value.scrollHeight
    }
  },
)

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Session Log</h3>
      <span class="text-xs text-gray-400 dark:text-gray-500">{{ session.log.length }} entries</span>
    </div>

    <div
      ref="logEl"
      class="flex-1 overflow-y-auto space-y-2 pr-1"
    >
      <div
        v-for="entry in session.log"
        :key="entry.id"
        class="flex gap-2"
        :class="entry.direction === 'OUT' ? 'flex-row-reverse' : 'flex-row'"
      >
        <div
          class="max-w-[85%] rounded-lg px-3 py-2 text-xs font-mono leading-snug whitespace-pre-wrap"
          :class="[
            entry.direction === 'OUT'
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none',
          ]"
        >
          {{ entry.content }}

          <div class="flex items-center justify-between gap-2 mt-1 opacity-60">
            <span class="text-[10px]">{{ formatTime(entry.timestamp) }}</span>
            <span v-if="entry.type" class="text-[10px] font-semibold">{{ entry.type }}</span>
          </div>
        </div>
      </div>

      <p v-if="session.log.length === 0" class="text-xs text-gray-400 dark:text-gray-500 italic text-center pt-4">
        No activity yet
      </p>
    </div>
  </div>
</template>
