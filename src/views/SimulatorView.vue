<script setup lang="ts">
import PhoneFrame from '@/components/simulator/PhoneFrame.vue'
import SessionLog from '@/components/simulator/SessionLog.vue'
import { useFlowStore } from '@/stores/flow'
import { useSettingsStore } from '@/stores/settings'

const flow = useFlowStore()
const settings = useSettingsStore()

function onFlowFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const ok = flow.loadFromJson(reader.result as string)
    if (ok) flow.setFlowName(file.name.replace(/\.json$/, ''))
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
    <!-- Phone -->
    <div class="flex-shrink-0">
      <PhoneFrame />
    </div>

    <!-- Right panel -->
    <div class="flex flex-col gap-6 w-full max-w-md">
      <!-- Session log -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 h-80 flex flex-col">
        <SessionLog />
      </div>

      <!-- Settings panel -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Settings</h3>

        <div class="space-y-3">
          <!-- Delay slider -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
              Network delay
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="50"
              :value="settings.delayMs"
              class="flex-1 accent-green-600"
              @input="settings.setDelay(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="text-xs font-mono text-gray-500 dark:text-gray-400 w-14 text-right">
              {{ settings.delayMs }}ms
            </span>
          </div>

          <!-- Live endpoint (only in live mode) -->
          <div v-if="settings.mode === 'live'" class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
              Endpoint
            </label>
            <input
              :value="settings.liveEndpointUrl"
              type="url"
              class="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
              @input="settings.setLiveEndpointUrl(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Current flow -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
              Flow
            </label>
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">
              {{ flow.flowName }}
            </span>
            <button
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              @click="flow.loadDefault"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Validation errors -->
        <div
          v-if="flow.validationErrors.length > 0"
          class="mt-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-2"
        >
          <p
            v-for="err in flow.validationErrors"
            :key="err"
            class="text-xs text-red-600 dark:text-red-400"
          >
            {{ err }}
          </p>
        </div>
      </div>

      <!-- Flow JSON upload -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Load Flow (JSON)</h3>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept=".json"
            class="hidden"
            @change="onFlowFileChange"
          />
          <span class="px-3 py-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Choose JSON file…
          </span>
        </label>
      </div>
    </div>
  </div>
</template>
