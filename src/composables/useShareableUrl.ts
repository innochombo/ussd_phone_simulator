import { ref } from 'vue'
import { useFlowStore } from '@/stores/flow'
import { parseFlowJson } from '@/engine/FlowParser'

const HASH_KEY = 'flow'

function encodeFlow(json: string): string {
  return btoa(unescape(encodeURIComponent(json)))
}

function decodeFlow(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded)))
}

export function useShareableUrl() {
  const flow = useFlowStore()
  const copied = ref(false)
  const loadError = ref('')

  function buildUrl(): string {
    const encoded = encodeFlow(flow.rawJson)
    const url = new URL(window.location.href)
    url.hash = `${HASH_KEY}=${encoded}`
    return url.toString()
  }

  async function copyShareUrl() {
    const url = buildUrl()
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  }

  function loadFromHash(): boolean {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const encoded = params.get(HASH_KEY)
    if (!encoded) return false

    try {
      const json = decodeFlow(encoded)
      const result = parseFlowJson(json)
      if (result.ok && result.flow) {
        flow.loadFromJson(json)
        flow.setFlowName('Shared flow')
        window.location.hash = ''
        return true
      }
      loadError.value = result.errors[0] ?? 'Invalid flow in URL'
    } catch {
      loadError.value = 'Could not decode flow from URL'
    }
    return false
  }

  return { copied, loadError, copyShareUrl, loadFromHash }
}
