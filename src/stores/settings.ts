import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SimulatorMode = 'mock' | 'live'
export type ThemeMode = 'light' | 'dark'
export type RequestFormat = 'json' | 'africas-talking'

export const useSettingsStore = defineStore('settings', () => {
  const msisdn = ref('265888000001')
  const serviceCode = ref('*123#')
  const mode = ref<SimulatorMode>('mock')
  const delayMs = ref(300)
  const theme = ref<ThemeMode>('light')

  // Live mode
  const liveEndpointUrl = ref('http://localhost:8000/ussd')
  const requestFormat = ref<RequestFormat>('json')
  const networkCode = ref('63902')
  const requestTimeoutMs = ref(10000)
  const customHeadersRaw = ref('')  // JSON string, e.g. {"Authorization":"Bearer ..."}

  function setMsisdn(value: string) { msisdn.value = value }
  function setServiceCode(value: string) { serviceCode.value = value }
  function setMode(value: SimulatorMode) { mode.value = value }
  function setDelay(ms: number) { delayMs.value = Math.max(0, Math.min(5000, ms)) }
  function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }
  function setLiveEndpointUrl(url: string) { liveEndpointUrl.value = url }
  function setRequestFormat(f: RequestFormat) { requestFormat.value = f }
  function setNetworkCode(code: string) { networkCode.value = code }
  function setRequestTimeoutMs(ms: number) { requestTimeoutMs.value = Math.max(1000, Math.min(60000, ms)) }
  function setCustomHeadersRaw(raw: string) { customHeadersRaw.value = raw }

  function parsedCustomHeaders(): Record<string, string> {
    if (!customHeadersRaw.value.trim()) return {}
    try {
      return JSON.parse(customHeadersRaw.value) as Record<string, string>
    } catch {
      return {}
    }
  }

  return {
    msisdn,
    serviceCode,
    mode,
    delayMs,
    theme,
    liveEndpointUrl,
    requestFormat,
    networkCode,
    requestTimeoutMs,
    customHeadersRaw,
    setMsisdn,
    setServiceCode,
    setMode,
    setDelay,
    toggleTheme,
    setLiveEndpointUrl,
    setRequestFormat,
    setNetworkCode,
    setRequestTimeoutMs,
    setCustomHeadersRaw,
    parsedCustomHeaders,
  }
})
