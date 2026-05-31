<script setup lang="ts">
import { ref } from 'vue'
import PhoneFrame from '@/components/simulator/PhoneFrame.vue'
import SessionLog from '@/components/simulator/SessionLog.vue'
import LiveModePanel from '@/components/simulator/LiveModePanel.vue'
import { useFlowStore } from '@/stores/flow'
import { useSettingsStore } from '@/stores/settings'

const flow = useFlowStore()
const settings = useSettingsStore()

const activeTab = ref<'general' | 'live'>('general')

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

      <!-- Settings panel with tabs -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Tab bar -->
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="tab in [{ key: 'general', label: 'General' }, { key: 'live', label: 'Live mode' }]"
            :key="tab.key"
            class="flex-1 py-2 text-xs font-semibold transition-colors"
            :class="activeTab === tab.key
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 -mb-px bg-white dark:bg-gray-900'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="activeTab = tab.key as typeof activeTab"
          >
            {{ tab.label }}
            <span
              v-if="tab.key === 'live' && settings.mode === 'live'"
              class="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle"
            />
          </button>
        </div>

        <div class="p-4">
          <!-- General tab -->
          <template v-if="activeTab === 'general'">
            <div class="space-y-3">
              <!-- Mock delay slider -->
              <div v-if="settings.mode === 'mock'" class="flex items-center gap-3">
                <label class="text-xs text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">
                  Mock delay
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

              <!-- Active flow -->
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Flow</label>
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {{ flow.flowName }}
                </span>
                <button
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                  @click="flow.loadDefault"
                >
                  Reset
                </button>
              </div>

              <!-- Flow file upload -->
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Load JSON</label>
                <label class="cursor-pointer">
                  <input type="file" accept=".json" class="hidden" @change="onFlowFileChange" />
                  <span class="text-xs px-2.5 py-1 rounded-md border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    Choose file…
                  </span>
                </label>
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
          </template>

          <!-- Live mode tab -->
          <template v-else>
            <div
              v-if="settings.mode !== 'live'"
              class="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 px-3 py-2 mb-4"
            >
              <p class="text-xs text-yellow-700 dark:text-yellow-300">
                Currently in <strong>Mock</strong> mode. Switch to Live from the top toolbar to activate these settings.
              </p>
            </div>
            <LiveModePanel />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
