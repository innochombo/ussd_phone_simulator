<script setup lang="ts">
import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useConnectionTest } from '@/composables/useConnectionTest'
import type { RequestFormat } from '@/stores/settings'

const settings = useSettingsStore()
const { status: testStatus, message: testMessage, test, reset: resetTest } = useConnectionTest()

const FORMAT_LABELS: Record<RequestFormat, string> = {
  'json': 'JSON (internal)',
  'africas-talking': "Africa's Talking",
}

// Reset test status when any live setting changes
watch(
  () => [settings.liveEndpointUrl, settings.requestFormat, settings.networkCode,
    settings.requestTimeoutMs, settings.customHeadersRaw],
  resetTest,
)
</script>

<template>
  <div class="space-y-4">
    <!-- Endpoint URL -->
    <div>
      <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
        Endpoint URL
      </label>
      <div class="flex gap-2">
        <input
          :value="settings.liveEndpointUrl"
          type="url"
          placeholder="http://localhost:8000/ussd"
          class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          @input="settings.setLiveEndpointUrl(($event.target as HTMLInputElement).value)"
        />
        <!-- Test button -->
        <button
          :disabled="testStatus === 'testing'"
          class="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          :class="testStatus === 'ok'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
            : testStatus === 'error'
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
          @click="test"
        >
          <span v-if="testStatus === 'testing'" class="animate-pulse">Testing…</span>
          <span v-else-if="testStatus === 'ok'">✓ OK</span>
          <span v-else-if="testStatus === 'error'">✕ Fail</span>
          <span v-else>Test</span>
        </button>
      </div>
      <p
        v-if="testMessage"
        class="mt-1 text-[11px] font-mono"
        :class="testStatus === 'ok'
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'"
      >
        {{ testMessage }}
      </p>
    </div>

    <!-- Request format -->
    <div>
      <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
        Request format
      </label>
      <div class="flex gap-2">
        <button
          v-for="(label, fmt) in FORMAT_LABELS"
          :key="fmt"
          class="flex-1 py-1.5 rounded-md border text-xs font-medium transition-colors"
          :class="settings.requestFormat === fmt
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          @click="settings.setRequestFormat(fmt as RequestFormat)"
        >
          {{ label }}
        </button>
      </div>
      <p class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        <span v-if="settings.requestFormat === 'africas-talking'">
          POST form-encoded: <code class="font-mono">sessionId, serviceCode, phoneNumber, networkCode, text</code>
        </span>
        <span v-else>
          POST JSON: <code class="font-mono">{ sessionId, serviceCode, msisdn, input }</code>
        </span>
      </p>
    </div>

    <!-- Network code (AT only) -->
    <div v-if="settings.requestFormat === 'africas-talking'">
      <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
        Network code
      </label>
      <input
        :value="settings.networkCode"
        type="text"
        placeholder="63902"
        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
        @input="settings.setNetworkCode(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Timeout -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">Timeout</label>
        <span class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ settings.requestTimeoutMs / 1000 }}s</span>
      </div>
      <input
        type="range"
        min="1000"
        max="30000"
        step="1000"
        :value="settings.requestTimeoutMs"
        class="w-full accent-blue-600"
        @input="settings.setRequestTimeoutMs(Number(($event.target as HTMLInputElement).value))"
      />
    </div>

    <!-- Custom headers -->
    <div>
      <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
        Custom headers <span class="font-normal text-gray-400">(JSON)</span>
      </label>
      <textarea
        :value="settings.customHeadersRaw"
        rows="3"
        placeholder='{"Authorization": "Bearer token", "X-Api-Key": "..."}'
        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
        @input="settings.setCustomHeadersRaw(($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- CORS proxy tip -->
    <div class="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-3 py-2">
      <p class="text-[11px] text-blue-700 dark:text-blue-300 leading-snug">
        <strong>CORS issues?</strong> In dev, prefix the URL with
        <code class="font-mono bg-blue-100 dark:bg-blue-900 px-0.5 rounded">/ussd-proxy</code>
        and set <code class="font-mono bg-blue-100 dark:bg-blue-900 px-0.5 rounded">VITE_PROXY_TARGET</code>
        in <code class="font-mono">.env.local</code> — Vite will forward the request server-side.
      </p>
    </div>
  </div>
</template>
