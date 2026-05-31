<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import { useFlowStore } from '@/stores/flow'
import { useSettingsStore } from '@/stores/settings'
import { parseFlowJson } from '@/engine/FlowParser'

const flow = useFlowStore()
const settings = useSettingsStore()

const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null)
const localJson = ref(flow.rawJson)
const isDirty = ref(false)
const liveErrors = ref<string[]>([])

const monacoTheme = computed(() => settings.theme === 'dark' ? 'vs-dark' : 'vs')

function onEditorChange(value: string) {
  localJson.value = value
  isDirty.value = value !== flow.rawJson

  const result = parseFlowJson(value)
  liveErrors.value = result.errors
}

function apply() {
  const ok = flow.loadFromJson(localJson.value)
  if (ok) {
    isDirty.value = false
    liveErrors.value = []
  }
}

function revert() {
  localJson.value = flow.rawJson
  isDirty.value = false
  liveErrors.value = []
}

function format() {
  editorRef.value?.format()
}

// Sync if external load (e.g., file upload from simulator view)
watch(() => flow.rawJson, (newJson) => {
  if (!isDirty.value) {
    localJson.value = newJson
  }
})
</script>

<template>
  <div class="flex flex-col h-full gap-0">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Flow Editor</span>
        <span
          v-if="isDirty"
          class="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-medium"
        >
          unsaved
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          title="Format document"
          @click="format"
        >
          Format
        </button>

        <button
          :disabled="!isDirty"
          class="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="revert"
        >
          Revert
        </button>

        <button
          :disabled="liveErrors.length > 0 || !isDirty"
          class="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="apply"
        >
          Apply
        </button>
      </div>
    </div>

    <!-- Monaco -->
    <div class="flex-1 overflow-hidden">
      <MonacoEditor
        ref="editorRef"
        v-model="localJson"
        language="json"
        :theme="monacoTheme"
        @change="onEditorChange"
      />
    </div>

    <!-- Error panel -->
    <div
      v-if="liveErrors.length > 0"
      class="flex-shrink-0 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 max-h-28 overflow-y-auto"
    >
      <p
        v-for="err in liveErrors"
        :key="err"
        class="text-xs font-mono text-red-600 dark:text-red-400 leading-snug"
      >
        ✕ {{ err }}
      </p>
    </div>
  </div>
</template>
