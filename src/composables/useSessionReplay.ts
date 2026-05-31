import { ref, readonly } from 'vue'
import type { SessionLogEntry } from '@/types/ussd'

const ENTRY_DELAY_MS = 800

export function useSessionReplay() {
  const isReplaying = ref(false)
  const replayIndex = ref(-1)
  const replayEntries = ref<SessionLogEntry[]>([])

  async function replay(entries: SessionLogEntry[]) {
    if (isReplaying.value || entries.length === 0) return

    isReplaying.value = true
    replayEntries.value = []
    replayIndex.value = 0

    for (let i = 0; i < entries.length; i++) {
      if (!isReplaying.value) break
      await delay(i === 0 ? 0 : ENTRY_DELAY_MS)
      replayEntries.value = entries.slice(0, i + 1)
      replayIndex.value = i
    }

    isReplaying.value = false
    replayIndex.value = -1
  }

  function stop() {
    isReplaying.value = false
  }

  function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
  }

  return {
    isReplaying: readonly(isReplaying),
    replayEntries: readonly(replayEntries),
    replayIndex: readonly(replayIndex),
    replay,
    stop,
  }
}
