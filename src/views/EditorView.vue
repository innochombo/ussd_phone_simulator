<script setup lang="ts">
import FlowEditor from '@/components/editor/FlowEditor.vue'
import FlowPreview from '@/components/editor/FlowPreview.vue'
import { ref } from 'vue'

type Panel = 'editor' | 'preview' | 'split'
const panel = ref<Panel>('split')
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-53px)]">
    <!-- Panel switcher -->
    <div class="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
      <button
        v-for="p in (['split', 'editor', 'preview'] as Panel[])"
        :key="p"
        class="capitalize text-xs px-3 py-1 rounded-md transition-colors"
        :class="panel === p
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
        @click="panel = p"
      >
        {{ p }}
      </button>
    </div>

    <!--
      Panels container.
      Split mode: stacked vertically on mobile, side-by-side on md+.
      Single mode: always full-size.
    -->
    <div
      class="flex flex-1 overflow-hidden"
      :class="panel === 'split' ? 'flex-col md:flex-row' : 'flex-row'"
    >
      <!-- Editor pane -->
      <div
        v-show="panel === 'editor' || panel === 'split'"
        class="flex flex-col overflow-hidden"
        :class="panel === 'split'
          ? 'h-1/2 md:h-auto md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800'
          : 'w-full border-r border-gray-200 dark:border-gray-800'"
      >
        <FlowEditor />
      </div>

      <!-- Preview pane -->
      <div
        v-show="panel === 'preview' || panel === 'split'"
        class="flex flex-col overflow-hidden"
        :class="panel === 'split' ? 'h-1/2 md:h-auto md:w-1/2' : 'w-full'"
      >
        <FlowPreview />
      </div>
    </div>
  </div>
</template>
