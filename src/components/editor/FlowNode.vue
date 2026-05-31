<script setup lang="ts">
import { computed } from 'vue'
import type { FlowMenu } from '@/types/ussd'

const props = defineProps<{
  menuKey: string
  menu: FlowMenu
  depth: number
  visited: Set<string>
  allMenus: Record<string, FlowMenu>
  selectedKey: string | null
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const isEnd = computed(() => props.menu.type === 'END' || !props.menu.options)

const childEntries = computed(() => {
  if (!props.menu.options) return []
  return Object.entries(props.menu.options).filter(([, opt]) => {
    return opt.next && opt.next !== props.menuKey
  })
})

const truncatedText = computed(() => {
  const first = props.menu.text.split('\n')[0]
  return first.length > 40 ? first.slice(0, 38) + '…' : first
})

function selectNode() {
  emit('select', props.menuKey)
}

function forwardSelect(key: string) {
  emit('select', key)
}
</script>

<template>
  <div class="flex flex-col items-start">
    <!-- Node -->
    <button
      class="flex items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-52 flex-shrink-0"
      :class="[
        selectedKey === menuKey
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
          : isEnd
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            : 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900',
      ]"
      @click="selectNode"
    >
      <span
        class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
        :class="isEnd ? 'bg-gray-400 dark:bg-gray-500' : 'bg-green-500 dark:bg-green-400'"
      />
      <div class="min-w-0">
        <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 font-mono truncate">
          {{ menuKey }}
        </p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
          {{ truncatedText }}
        </p>
        <span
          v-if="isEnd"
          class="inline-block mt-1 text-[10px] font-semibold px-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          END
        </span>
      </div>
    </button>

    <!-- Children -->
    <div v-if="childEntries.length > 0" class="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
      <div
        v-for="[optionKey, opt] in childEntries"
        :key="optionKey"
        class="flex items-start gap-2"
      >
        <div class="flex flex-col items-center flex-shrink-0 pt-3">
          <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1">
            {{ optionKey }}
          </span>
        </div>

        <!-- Recurse or show back-link if already visited -->
        <template v-if="!visited.has(opt.next!)">
          <FlowNode
            :menu-key="opt.next!"
            :menu="allMenus[opt.next!]"
            :depth="depth + 1"
            :visited="new Set([...visited, menuKey])"
            :all-menus="allMenus"
            :selected-key="selectedKey"
            @select="forwardSelect"
          />
        </template>
        <template v-else>
          <span class="text-xs font-mono text-blue-500 dark:text-blue-400 italic pt-2.5">
            ↺ {{ opt.next }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
