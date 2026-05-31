<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useSessionExport } from '@/composables/useSessionExport'
import { useSessionReplay } from '@/composables/useSessionReplay'
const session = useSessionStore()
const { exportJson, exportText } = useSessionExport()
const { isReplaying, replayEntries, replay, stop } = useSessionReplay()

const logEl = ref<HTMLElement | null>(null)
const showExportMenu = ref(false)

function scheduleCloseExport() {
  setTimeout(() => { showExportMenu.value = false }, 150)
}

const isEnded = computed(() =>
  session.status === 'END' || session.status === 'ERROR',
)

const displayedEntries = computed(() =>
  isReplaying.value ? replayEntries.value : session.log,
)

watch(
  () => displayedEntries.value.length,
  async () => {
    await nextTick()
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  },
)

function startReplay() {
  replay([...session.log])
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<template>
  <div class="flex flex-col h-full gap-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2 flex-shrink-0">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Session Log
        <span v-if="isReplaying" class="ml-2 text-xs font-normal text-blue-500 dark:text-blue-400 animate-pulse">
          replaying…
        </span>
      </h3>

      <div class="flex items-center gap-1">
        <!-- Replay -->
        <button
          v-if="isEnded && !isReplaying && session.log.length > 0"
          class="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Replay session"
          @click="startReplay"
        >
          ▶ Replay
        </button>
        <button
          v-if="isReplaying"
          class="text-xs px-2 py-0.5 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          @click="stop"
        >
          ■ Stop
        </button>

        <!-- Export dropdown -->
        <div v-if="session.log.length > 0" class="relative">
          <button
            class="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="showExportMenu = !showExportMenu"
            @blur="scheduleCloseExport"
          >
            ↓ Export
          </button>
          <div
            v-if="showExportMenu"
            class="absolute right-0 top-full mt-1 w-32 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10 overflow-hidden"
          >
            <button
              class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="exportJson(); showExportMenu = false"
            >
              JSON
            </button>
            <button
              class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="exportText(); showExportMenu = false"
            >
              Plain text
            </button>
          </div>
        </div>

        <span class="text-xs text-gray-400 dark:text-gray-500">{{ session.log.length }}</span>
      </div>
    </div>

    <!-- Log bubbles -->
    <div ref="logEl" class="flex-1 overflow-y-auto space-y-2 pr-1">
      <div
        v-for="entry in displayedEntries"
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
