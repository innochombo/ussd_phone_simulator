<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const settings = useSettingsStore()

const isDark = computed(() => settings.theme === 'dark')
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <!-- Topbar -->
      <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-lg font-bold tracking-tight">USSD Simulator</span>

          <!-- Nav -->
          <nav class="flex items-center gap-1">
            <RouterLink
              v-for="link in [{ to: '/', label: 'Simulator' }, { to: '/editor', label: 'Flow Editor' }]"
              :key="link.to"
              :to="link.to"
              class="text-sm px-3 py-1 rounded-md transition-colors"
              :class="(route.path === link.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
            >
              {{ link.label }}
            </RouterLink>
          </nav>

          <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="settings.mode === 'mock'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'"
          >
            {{ settings.mode === 'mock' ? 'Mock' : 'Live' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Mode toggle -->
          <button
            class="text-xs px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="settings.setMode(settings.mode === 'mock' ? 'live' : 'mock')"
          >
            Switch to {{ settings.mode === 'mock' ? 'Live' : 'Mock' }}
          </button>

          <!-- Theme toggle -->
          <button
            class="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="settings.toggleTheme"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
