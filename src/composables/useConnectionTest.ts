import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

export function useConnectionTest() {
  const settings = useSettingsStore()
  const status = ref<TestStatus>('idle')
  const message = ref('')

  async function test() {
    if (status.value === 'testing') return
    status.value = 'testing'
    message.value = ''

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), settings.requestTimeoutMs)

    try {
      // Send a probe request — a minimal initial USSD dial (empty input, dummy session).
      // The backend will return CON/END regardless; we only care that it's reachable.
      const headers: Record<string, string> = { ...settings.parsedCustomHeaders() }

      let init: RequestInit

      if (settings.requestFormat === 'africas-talking') {
        const body = new URLSearchParams({
          sessionId: 'probe-' + Date.now(),
          serviceCode: settings.serviceCode,
          phoneNumber: settings.msisdn.startsWith('+') ? settings.msisdn : `+${settings.msisdn}`,
          networkCode: settings.networkCode,
          text: '',
        })
        init = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
          body: body.toString(),
          signal: controller.signal,
        }
      } else {
        init = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            sessionId: 'probe-' + Date.now(),
            serviceCode: settings.serviceCode,
            msisdn: settings.msisdn,
            input: '',
          }),
          signal: controller.signal,
        }
      }

      const res = await fetch(settings.liveEndpointUrl, init)
      if (res.ok) {
        status.value = 'ok'
        message.value = `HTTP ${res.status} — endpoint reachable`
      } else {
        status.value = 'error'
        message.value = `HTTP ${res.status} ${res.statusText}`
      }
    } catch (err) {
      status.value = 'error'
      if (err instanceof DOMException && err.name === 'AbortError') {
        message.value = `Timed out after ${settings.requestTimeoutMs}ms`
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        message.value = 'Network error — check URL and CORS headers'
      } else {
        message.value = err instanceof Error ? err.message : String(err)
      }
    } finally {
      clearTimeout(timer)
    }
  }

  function reset() {
    status.value = 'idle'
    message.value = ''
  }

  return { status, message, test, reset }
}
