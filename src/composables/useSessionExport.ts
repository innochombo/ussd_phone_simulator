import { useSessionStore } from '@/stores/session'
import html2canvas from 'html2canvas'

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

  async function exportImage(element: HTMLElement) {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `session-log-${new Date().toISOString().slice(0, 10)}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to export image:', error)
      throw error
    }
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

  return { exportJson, exportText, exportImage }
}
