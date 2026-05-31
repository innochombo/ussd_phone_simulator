import { computed, ref, watch } from 'vue'
import { MockAdapter } from '@/adapters/MockAdapter'
import { HttpAdapter } from '@/adapters/HttpAdapter'
import { useSessionStore } from '@/stores/session'
import { useFlowStore } from '@/stores/flow'
import { useSettingsStore } from '@/stores/settings'
import type { UssdAdapter } from '@/types/ussd'

let adapter: UssdAdapter | null = null

function buildAdapter(): UssdAdapter {
  const settings = useSettingsStore()
  const flow = useFlowStore()

  if (settings.mode === 'live') {
    return new HttpAdapter({
      endpointUrl: settings.liveEndpointUrl,
      format: settings.requestFormat,
      networkCode: settings.networkCode,
      timeoutMs: settings.requestTimeoutMs,
      customHeaders: settings.parsedCustomHeaders(),
    })
  }
  return new MockAdapter(flow.flow, settings.delayMs)
}

export function useSimulator() {
  const session = useSessionStore()
  const flow = useFlowStore()
  const settings = useSettingsStore()

  const inputValue = ref('')
  const canSend = computed(() => session.status === 'ACTIVE' && !session.isLoading)
  const isIdle = computed(() => session.status === 'IDLE')
  const isEnded = computed(() => session.status === 'END' || session.status === 'ERROR')

  async function dial() {
    if (session.status !== 'IDLE' && !isEnded.value) return

    adapter = buildAdapter()
    adapter.reset()

    const id = crypto.randomUUID()
    session.startSession(id, settings.serviceCode)
    session.setLoading(true)

    try {
      const response = await adapter.send({
        msisdn: settings.msisdn,
        serviceCode: settings.serviceCode,
        input: '',
        sessionId: id,
      })

      session.addLogEntry({ direction: 'IN', content: response.message, type: response.type })

      if (response.type === 'END') {
        session.endSession(response.message)
      } else {
        session.setActive(response.message)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      session.errorSession(`Error: ${msg}`)
      session.addLogEntry({ direction: 'IN', content: `Error: ${msg}` })
    } finally {
      session.setLoading(false)
    }
  }

  async function send(userInput: string) {
    if (!canSend.value || !adapter || !session.sessionId) return

    const trimmed = userInput.trim()

    // Africa's Talking format uses cumulative input; push before sending
    session.pushInput(trimmed)
    const atText = session.cumulativeInput()

    session.addLogEntry({ direction: 'OUT', content: trimmed })
    session.setLoading(true)
    inputValue.value = ''

    // For AT format send the cumulative text; for JSON send only the current input
    const wireInput = settings.mode === 'live' && settings.requestFormat === 'africas-talking'
      ? atText
      : trimmed

    try {
      const response = await adapter.send({
        msisdn: settings.msisdn,
        serviceCode: settings.serviceCode,
        input: wireInput,
        sessionId: session.sessionId,
      })

      session.addLogEntry({ direction: 'IN', content: response.message, type: response.type })

      if (response.type === 'END') {
        session.endSession(response.message)
      } else {
        session.setActive(response.message)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      session.errorSession(`Error: ${msg}`)
      session.addLogEntry({ direction: 'IN', content: `Error: ${msg}` })
    } finally {
      session.setLoading(false)
    }
  }

  function hangUp() {
    if (adapter) adapter.reset()
    session.reset()
    inputValue.value = ''
  }

  // Rebuild mock adapter when flow changes
  watch(
    () => flow.flow,
    () => {
      if (adapter instanceof MockAdapter) {
        adapter.updateFlow(flow.flow)
      }
    },
  )

  // Rebuild live adapter when relevant settings change while session is idle
  watch(
    () => [settings.liveEndpointUrl, settings.requestFormat, settings.networkCode,
      settings.requestTimeoutMs, settings.customHeadersRaw],
    () => {
      if (isIdle.value || isEnded.value) {
        adapter = null
      }
    },
  )

  return {
    inputValue,
    canSend,
    isIdle,
    isEnded,
    dial,
    send,
    hangUp,
  }
}
