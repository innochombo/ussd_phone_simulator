import { useSessionStore } from '@/stores/session'

export function useSessionExport() {
  const session = useSessionStore()

  function exportJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      sessionId: session.sessionId,
      entries: session.log,
    }
    download(JSON.stringify(data, null, 2), 'session-log.json', 'application/json')
  }

  function exportText() {
    const lines: string[] = [
      `USSD Session Log`,
      `Exported: ${new Date().toLocaleString()}`,
      `Session ID: ${session.sessionId ?? 'n/a'}`,
      `─`.repeat(40),
      '',
    ]

    for (const entry of session.log) {
      const time = new Date(entry.timestamp).toLocaleTimeString()
      const dir = entry.direction === 'OUT' ? '→ You' : '← Server'
      const badge = entry.type ? ` [${entry.type}]` : ''
      lines.push(`[${time}] ${dir}${badge}`)
      lines.push(entry.content)
      lines.push('')
    }

    download(lines.join('\n'), 'session-log.txt', 'text/plain')
  }

  function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportJson, exportText }
}
