import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SimulatorMode = 'mock' | 'live'
export type ThemeMode = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  const msisdn = ref('265888000001')
  const serviceCode = ref('*123#')
  const mode = ref<SimulatorMode>('mock')
  const delayMs = ref(300)
  const theme = ref<ThemeMode>('light')
  const liveEndpointUrl = ref('http://localhost:8000/ussd')

  function setMsisdn(value: string) {
    msisdn.value = value
  }

  function setServiceCode(value: string) {
    serviceCode.value = value
  }

  function setMode(value: SimulatorMode) {
    mode.value = value
  }

  function setDelay(ms: number) {
    delayMs.value = Math.max(0, Math.min(5000, ms))
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setLiveEndpointUrl(url: string) {
    liveEndpointUrl.value = url
  }

  return {
    msisdn,
    serviceCode,
    mode,
    delayMs,
    theme,
    liveEndpointUrl,
    setMsisdn,
    setServiceCode,
    setMode,
    setDelay,
    toggleTheme,
    setLiveEndpointUrl,
  }
})
