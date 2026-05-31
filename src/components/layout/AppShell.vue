<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settings = useSettingsStore()
const isDark = computed(() => settings.theme === 'dark')
const menuOpen = ref(false)

// Close the mobile menu on navigation
watch(() => route.path, () => { menuOpen.value = false })

const NAV_LINKS = [
  { to: '/', label: 'Simulator' },
  { to: '/editor', label: 'Flow Editor' },
  { to: '/about', label: 'About' },
]

function toggleMode() {
  settings.setMode(settings.mode === 'mock' ? 'live' : 'mock')
  menuOpen.value = false
}
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">

      <!-- ── Header ── -->
      <header class="relative border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between z-30">

        <!-- Left: logo + desktop nav + mode badge -->
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold tracking-tight select-none">USSD Simulator</span>

          <!-- Desktop nav (hidden on mobile) -->
          <nav class="hidden md:flex items-center gap-1">
            <RouterLink
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              class="text-sm px-3 py-1 rounded-md transition-colors"
              :class="route.path === link.to
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
            >
              {{ link.label }}
            </RouterLink>
          </nav>

          <!-- Mode badge (desktop only) -->
          <span
            class="hidden md:inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="settings.mode === 'mock'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'"
          >
            {{ settings.mode === 'mock' ? 'Mock' : 'Live' }}
          </span>
        </div>

        <!-- Right: desktop controls + mobile hamburger -->
        <div class="flex items-center gap-2">
          <!-- Desktop controls (hidden on mobile) -->
          <button
            class="hidden md:block text-xs px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="settings.setMode(settings.mode === 'mock' ? 'live' : 'mock')"
          >
            Switch to {{ settings.mode === 'mock' ? 'Live' : 'Mock' }}
          </button>

          <!-- Theme toggle (always visible) -->
          <button
            class="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="settings.toggleTheme"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>

          <!-- Hamburger (mobile only) -->
          <button
            class="md:hidden w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-expanded="menuOpen"
            aria-label="Toggle menu"
            @click="menuOpen = !menuOpen"
          >
            <span
              class="block w-4 h-0.5 bg-gray-600 dark:bg-gray-400 transition-transform duration-200 origin-center"
              :class="menuOpen ? 'rotate-45 translate-y-[5px]' : ''"
            />
            <span
              class="block w-4 h-0.5 bg-gray-600 dark:bg-gray-400 transition-opacity duration-200"
              :class="menuOpen ? 'opacity-0' : ''"
            />
            <span
              class="block w-4 h-0.5 bg-gray-600 dark:bg-gray-400 transition-transform duration-200 origin-center"
              :class="menuOpen ? '-rotate-45 -translate-y-[5px]' : ''"
            />
          </button>
        </div>
      </header>

      <!-- ── Mobile popover menu ── -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="menuOpen"
          class="md:hidden absolute left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg"
          style="top: 53px"
        >
          <!-- Nav links -->
          <nav class="px-4 pt-3 pb-1 space-y-1">
            <RouterLink
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              class="flex items-center px-3 py-2 rounded-md text-sm transition-colors"
              :class="route.path === link.to
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
            >
              {{ link.label }}
            </RouterLink>
          </nav>

          <div class="border-t border-gray-100 dark:border-gray-800 mx-4" />

          <!-- Actions -->
          <div class="px-4 py-3 flex items-center justify-between">
            <!-- Mode badge + toggle -->
            <div class="flex items-center gap-2">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="settings.mode === 'mock'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'"
              >
                {{ settings.mode === 'mock' ? 'Mock' : 'Live' }}
              </span>
              <button
                class="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="toggleMode"
              >
                Switch to {{ settings.mode === 'mock' ? 'Live' : 'Mock' }}
              </button>
            </div>

            <!-- Close button -->
            <button
              class="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded"
              @click="menuOpen = false"
            >
              Close
            </button>
          </div>
        </div>
      </Transition>

      <!-- Backdrop to close menu when tapping outside -->
      <div
        v-if="menuOpen"
        class="md:hidden fixed inset-0 z-10"
        aria-hidden="true"
        @click="menuOpen = false"
      />

      <!-- Main content -->
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
