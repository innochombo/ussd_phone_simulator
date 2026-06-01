<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useSessionExport } from '@/composables/useSessionExport'
import { useSessionReplay } from '@/composables/useSessionReplay'
const session = useSessionStore()
const { exportJson, exportText, exportImage } = useSessionExport()
const { isReplaying, replayEntries, replay, stop } = useSessionReplay()

const logEl = ref<HTMLElement | null>(null)
const captureEl = ref<HTMLElement | null>(null)
const showExportMenu = ref(false)
const isExportingImage = ref(false)

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

async function handleExportImage() {
  if (captureEl.value) {
    try {
      isExportingImage.value = true
      await exportImage(captureEl.value)
      showExportMenu.value = false
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      isExportingImage.value = false
    }
  }
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
            <button
              :disabled="isExportingImage"
              class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleExportImage()"
            >
              {{ isExportingImage ? 'Exporting…' : 'Image' }}
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

    <!-- Hidden capture container for image export -->
    <div
      ref="captureEl"
      class="fixed -left-[9999px] top-0 w-[800px]"
      style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff; color: #111827"
    >
      <div style="padding: 24px">
        <!-- Header -->
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #d1d5db">
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 8px">USSD Session Log</h2>
          <p style="font-size: 14px; color: #4b5563; margin: 4px 0">
            Exported: {{ new Date().toLocaleString() }}
          </p>
          <p style="font-size: 14px; color: #4b5563; margin: 4px 0">
            Session ID: {{ session.sessionId ?? 'n/a' }}
          </p>
        </div>

        <!-- Log entries -->
        <div style="display: flex; flex-direction: column; gap: 12px">
          <div
            v-for="entry in session.log"
            :key="entry.id"
            style="display: flex; gap: 12px"
            :style="entry.direction === 'OUT' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }"
          >
            <div
              style="max-width: 70%; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-family: 'Courier New', monospace; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word"
              :style="[
                entry.direction === 'OUT'
                  ? { backgroundColor: '#2563eb', color: '#ffffff', borderTopRightRadius: '0' }
                  : { backgroundColor: '#e5e7eb', color: '#111827', borderTopLeftRadius: '0' },
              ]"
            >
              {{ entry.content }}
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; opacity: 0.7; font-size: 12px">
                <span>{{ new Date(entry.timestamp).toLocaleTimeString() }}</span>
                <span v-if="entry.type" style="font-weight: 600">{{ entry.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
