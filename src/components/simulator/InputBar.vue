<script setup lang="ts">
import { ref } from 'vue'
import { useSimulator } from '@/composables/useSimulator'
import { useSettingsStore } from '@/stores/settings'

const { inputValue, canSend, isIdle, isEnded, dial, send, hangUp } = useSimulator()
const settings = useSettingsStore()

const inputEl = ref<HTMLInputElement | null>(null)

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

function pressKey(key: string) {
  if (!canSend.value) return
  inputValue.value += key
  inputEl.value?.focus()
}

function pressBackspace() {
  inputValue.value = inputValue.value.slice(0, -1)
}

function onSubmit() {
  if (canSend.value && inputValue.value.trim()) {
    send(inputValue.value)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') onSubmit()
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Service code + dial / hangup row -->
    <div class="flex items-center gap-2">
      <input
        v-model="settings.serviceCode"
        type="text"
        placeholder="*123#"
        class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
        :disabled="!isIdle && !isEnded"
      />

      <button
        v-if="isIdle || isEnded"
        class="px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
        @click="dial"
      >
        Dial
      </button>

      <button
        v-else
        class="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        @click="hangUp"
      >
        End
      </button>
    </div>

    <!-- Text input + send -->
    <div class="flex items-center gap-2">
      <input
        ref="inputEl"
        v-model="inputValue"
        type="text"
        placeholder="Enter option…"
        :disabled="!canSend"
        class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        @keydown="onKeydown"
      />
      <button
        :disabled="!canSend || !inputValue.trim()"
        class="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="onSubmit"
      >
        Send
      </button>
    </div>

    <!-- Keypad -->
    <div class="grid grid-cols-3 gap-1.5">
      <template v-for="row in KEYPAD" :key="row.join('')">
        <button
          v-for="key in row"
          :key="key"
          :disabled="!canSend"
          class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-900 dark:text-gray-100 py-2 text-base font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
          @click="pressKey(key)"
        >
          {{ key }}
        </button>
      </template>

      <!-- Backspace spanning last slot -->
      <button
        :disabled="!canSend"
        class="col-span-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-500 dark:text-gray-400 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="pressBackspace"
      >
        ⌫ Clear last
      </button>
    </div>

  </div>
</template>
