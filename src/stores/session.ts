import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SessionLogEntry, SessionStatus } from '@/types/ussd'

export const useSessionStore = defineStore('session', () => {
  const sessionId = ref<string | null>(null)
  const status = ref<SessionStatus>('IDLE')
  const currentText = ref('')
  const history = ref<string[]>([])
  const log = ref<SessionLogEntry[]>([])
  const isLoading = ref(false)

  function startSession(id: string, serviceCode: string) {
    sessionId.value = id
    status.value = 'DIALING'
    currentText.value = ''
    history.value = []
    log.value = []

    addLogEntry({
      direction: 'OUT',
      content: `Dialing ${serviceCode}…`,
    })
  }

  function setActive(text: string) {
    status.value = 'ACTIVE'
    currentText.value = text
  }

  function endSession(text: string) {
    status.value = 'END'
    currentText.value = text
  }

  function errorSession(message: string) {
    status.value = 'ERROR'
    currentText.value = message
  }

  function reset() {
    sessionId.value = null
    status.value = 'IDLE'
    currentText.value = ''
    history.value = []
    log.value = []
    isLoading.value = false
  }

  function pushHistory(menuKey: string) {
    history.value.push(menuKey)
  }

  function popHistory(): string | undefined {
    return history.value.pop()
  }

  function addLogEntry(entry: Omit<SessionLogEntry, 'id' | 'timestamp'>) {
    log.value.push({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    })
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  return {
    sessionId,
    status,
    currentText,
    history,
    log,
    isLoading,
    startSession,
    setActive,
    endSession,
    errorSession,
    reset,
    pushHistory,
    popHistory,
    addLogEntry,
    setLoading,
  }
})
