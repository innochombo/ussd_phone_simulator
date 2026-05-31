<script setup lang="ts">
import { computed, ref } from 'vue'
import FlowNode from './FlowNode.vue'
import { useFlowStore } from '@/stores/flow'

const flow = useFlowStore()
const selectedKey = ref<string | null>(null)

const startMenu = computed(() => flow.flow.startMenu)
const menus = computed(() => flow.flow.menus)
const startMenuDef = computed(() => menus.value[startMenu.value])

const selectedMenu = computed(() =>
  selectedKey.value ? menus.value[selectedKey.value] : null,
)

const selectedMenuLines = computed(() =>
  selectedMenu.value?.text.split('\n') ?? [],
)

const menuCount = computed(() => Object.keys(menus.value).length)
const endCount = computed(() =>
  Object.values(menus.value).filter(m => m.type === 'END' || !m.options).length,
)

function onSelect(key: string) {
  selectedKey.value = selectedKey.value === key ? null : key
}
</script>

<template>
  <div class="flex flex-col h-full gap-0">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Flow Preview</span>
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{{ menuCount }} menus</span>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <span>{{ endCount }} END</span>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <span class="font-mono">start: {{ startMenu }}</span>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Tree -->
      <div class="flex-1 overflow-auto p-4">
        <div v-if="startMenuDef" class="inline-block min-w-max">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Entry point
            </span>
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <FlowNode
            :menu-key="startMenu"
            :menu="startMenuDef"
            :depth="0"
            :visited="new Set()"
            :all-menus="menus"
            :selected-key="selectedKey"
            @select="onSelect"
          />
        </div>

        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
          No valid flow loaded.
        </p>
      </div>

      <!-- Detail panel -->
      <div
        v-if="selectedKey && selectedMenu"
        class="w-64 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono">{{ selectedKey }}</span>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
            @click="selectedKey = null"
          >
            ✕
          </button>
        </div>

        <!-- Screen text preview -->
        <div class="rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-2 font-mono text-xs leading-snug mb-3">
          <p
            v-for="(line, i) in selectedMenuLines"
            :key="i"
            class="text-gray-800 dark:text-gray-200"
          >
            {{ line || ' ' }}
          </p>
        </div>

        <!-- Type badge -->
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs text-gray-500 dark:text-gray-400">Type:</span>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded"
            :class="(selectedMenu.type === 'END' || !selectedMenu.options)
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'"
          >
            {{ (selectedMenu.type === 'END' || !selectedMenu.options) ? 'END' : 'CON' }}
          </span>
        </div>

        <!-- Options -->
        <div v-if="selectedMenu.options">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Options</p>
          <div class="space-y-1">
            <div
              v-for="(opt, key) in selectedMenu.options"
              :key="key"
              class="flex items-center gap-2 text-xs"
            >
              <span class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300 flex-shrink-0">
                {{ key }}
              </span>
              <span class="text-gray-500 dark:text-gray-400">→</span>
              <button
                v-if="opt.next"
                class="font-mono text-blue-600 dark:text-blue-400 hover:underline truncate"
                @click="selectedKey = opt.next ?? null"
              >
                {{ opt.next }}
              </button>
              <span v-else-if="opt.action === 'end'" class="text-gray-400 dark:text-gray-500 italic">
                end session
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
