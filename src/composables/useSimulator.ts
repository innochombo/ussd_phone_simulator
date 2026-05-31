import { computed, ref, watch } from 'vue'
import { MockAdapter } from '@/adapters/MockAdapter'
import { HttpAdapter } from '@/adapters/HttpAdapter'
import { useSessionStore } from '@/stores/session'
import { useFlowStore } from '@/stores/flow'
import { useSettingsStore } from '@/stores/settings'
import type { UssdAdapter } from '@/types/ussd'

let adapter: UssdAdapter | null = null

function getAdapter(): UssdAdapter {
  const settings = useSettingsStore()
  const flow = useFlowStore()

  if (settings.mode === 'live') {
    return new HttpAdapter(settings.liveEndpointUrl)
  }
  return new MockAdapter(flow.flow, settings.delayMs)
}

export function useSimulator() {
  const session = useSessionStore()
  const flow = useFlowStore()
  const settings = useSettingsStore()

  const inputValue = ref('')
  const canSend = computed(() =>
    session.status === 'ACTIVE' && !session.isLoading,
  )
  const isIdle = computed(() => session.status === 'IDLE')
  const isEnded = computed(() => session.status === 'END' || session.status === 'ERROR')

  async function dial() {
    if (session.status !== 'IDLE' && !isEnded.value) return

    adapter = getAdapter()
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
    session.addLogEntry({ direction: 'OUT', content: trimmed })
    session.setLoading(true)
    inputValue.value = ''

    try {
      const response = await adapter.send({
        msisdn: settings.msisdn,
        serviceCode: settings.serviceCode,
        input: trimmed,
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

  watch(
    () => flow.flow,
    () => {
      if (adapter instanceof MockAdapter) {
        adapter.updateFlow(flow.flow)
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
