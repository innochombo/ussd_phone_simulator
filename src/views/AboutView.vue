<script setup lang="ts">
const REPO_SIMULATOR = 'https://github.com/innochombo/ussd_phone_simulator'
const REPO_FRAMEWORK = 'https://github.com/innochombo/php-ussd-framework'
const LIVE_SIMULATOR = 'https://ussd-phone-simulator.vercel.app/'

const SIMULATOR_DOCS = [
  { label: 'Architecture',           href: `${REPO_SIMULATOR}/blob/main/docs/architecture.md` },
  { label: 'Flow Definition',        href: `${REPO_SIMULATOR}/blob/main/docs/flow-definition.md` },
  { label: 'Usage Guide',            href: `${REPO_SIMULATOR}/blob/main/docs/usage-guide.md` },
  { label: 'Live Mode Setup',        href: `${REPO_SIMULATOR}/blob/main/docs/live-mode.md` },
  { label: 'Contributing',           href: `${REPO_SIMULATOR}/blob/main/docs/contributing.md` },
  { label: 'Changelog',              href: `${REPO_SIMULATOR}/blob/main/CHANGELOG.md` },
]

const FRAMEWORK_DOCS = [
  { label: 'README & Quick Start',   href: `${REPO_FRAMEWORK}#readme` },
  { label: 'Framework Philosophy',   href: `${REPO_FRAMEWORK}/blob/main/docs/framework-philosophy.md` },
  { label: 'Guidelines & Usage',     href: `${REPO_FRAMEWORK}/blob/main/docs/guidelines-usage.md` },
  { label: 'Contributing & AI',      href: `${REPO_FRAMEWORK}/blob/main/docs/contributing-and-prompts.md` },
  { label: 'Changelog',              href: `${REPO_FRAMEWORK}/blob/main/CHANGELOG.md` },
]

const TECH_STACK = [
  { name: 'Vue 3',          role: 'UI framework' },
  { name: 'TypeScript',     role: 'Type safety' },
  { name: 'Pinia',          role: 'State management' },
  { name: 'Tailwind CSS',   role: 'Styling' },
  { name: 'Monaco Editor',  role: 'Flow JSON editor' },
  { name: 'Zod',            role: 'Schema validation' },
  { name: 'Vite',           role: 'Build tool' },
]
</script>

<template>
  <div class="min-h-[calc(100vh-53px)] bg-gray-50 dark:bg-gray-950">
    <div class="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-12">

      <!-- ── Creator ── -->
      <section class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <!-- Photo -->
        <img
          src="/creator.jpg"
          alt="Innocent E Chombo"
          class="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-lg ring-2 ring-gray-200 dark:ring-gray-700"
        />

        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Innocent E Chombo
          </h1>
          <p class="text-base text-gray-500 dark:text-gray-400 mt-0.5">Software Engineer</p>

          <p class="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
            Building the <strong class="text-gray-800 dark:text-gray-200">PHP USSD Framework</strong> and this
            simulator to make USSD development faster, more testable, and accessible without carrier hardware.
          </p>

          <div class="flex items-center gap-3 mt-4 flex-wrap">
            <a
              :href="REPO_SIMULATOR"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Simulator repo
            </a>
            <a
              :href="REPO_FRAMEWORK"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Framework repo
            </a>
            <a
              :href="LIVE_SIMULATOR"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
            >
              Launch simulator ↗
            </a>
          </div>
        </div>
      </section>

      <div class="border-t border-gray-200 dark:border-gray-800" />

      <!-- ── About the project ── -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">About this project</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          The <strong class="text-gray-800 dark:text-gray-200">USSD Phone Simulator</strong> is a browser-based
          tool for testing USSD menu flows without a physical handset or carrier integration.
          It can run entirely offline using a JSON-defined mock flow, or connect to a real backend
          using the Africa's Talking wire format or a generic JSON protocol.
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          It is designed as a companion to the <strong class="text-gray-800 dark:text-gray-200">PHP USSD Framework</strong>
          — a zero-dependency PHP 8.1 state-machine framework for building production USSD applications —
          but works with any HTTP backend that speaks the supported protocols.
        </p>
      </section>

      <div class="border-t border-gray-200 dark:border-gray-800" />

      <!-- ── Docs grid ── -->
      <section class="grid sm:grid-cols-2 gap-6">

        <!-- Simulator docs -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">Simulator docs</h2>
          </div>
          <ul class="space-y-1">
            <li v-for="doc in SIMULATOR_DOCS" :key="doc.label">
              <a
                :href="doc.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline group"
              >
                <span class="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors">→</span>
                {{ doc.label }}
              </a>
            </li>
          </ul>
          <a
            :href="REPO_SIMULATOR"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1"
          >
            View on GitHub ↗
          </a>
        </div>

        <!-- Framework docs -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">Framework docs</h2>
          </div>
          <ul class="space-y-1">
            <li v-for="doc in FRAMEWORK_DOCS" :key="doc.label">
              <a
                :href="doc.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline group"
              >
                <span class="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors">→</span>
                {{ doc.label }}
              </a>
            </li>
          </ul>
          <a
            :href="REPO_FRAMEWORK"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1"
          >
            View on GitHub ↗
          </a>
        </div>
      </section>

      <div class="border-t border-gray-200 dark:border-gray-800" />

      <!-- ── Tech stack ── -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">Built with</h2>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tech in TECH_STACK"
            :key="tech.name"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ tech.name }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">· {{ tech.role }}</span>
          </div>
        </div>
      </section>

      <!-- ── Footer ── -->
      <footer class="pt-4 text-center text-xs text-gray-400 dark:text-gray-600">
        Built by Innocent E Chombo · MIT License
      </footer>

    </div>
  </div>
</template>
