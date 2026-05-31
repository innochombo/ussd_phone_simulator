import type { UssdAdapter, UssdRequest, UssdResponse } from '@/types/ussd'
import type { RequestFormat } from '@/stores/settings'

export interface HttpAdapterOptions {
  endpointUrl: string
  format: RequestFormat
  networkCode: string
  timeoutMs: number
  customHeaders: Record<string, string>
}

export class HttpAdapter implements UssdAdapter {
  private opts: HttpAdapterOptions

  constructor(opts: HttpAdapterOptions) {
    this.opts = { ...opts }
  }

  async send(req: UssdRequest): Promise<UssdResponse> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs)

    try {
      const response = this.opts.format === 'africas-talking'
        ? await this.sendAfricasTalking(req, controller.signal)
        : await this.sendJson(req, controller.signal)

      return response
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.opts.timeoutMs}ms`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  private async sendJson(req: UssdRequest, signal: AbortSignal): Promise<UssdResponse> {
    const res = await fetch(this.opts.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.opts.customHeaders,
      },
      body: JSON.stringify(req),
      signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    const data = await res.json() as UssdResponse
    if (!data.type || !data.message) {
      throw new Error('Invalid response: expected { type, message, sessionId }')
    }
    return data
  }

  private async sendAfricasTalking(req: UssdRequest, signal: AbortSignal): Promise<UssdResponse> {
    const body = new URLSearchParams({
      sessionId: req.sessionId,
      serviceCode: req.serviceCode,
      phoneNumber: req.msisdn.startsWith('+') ? req.msisdn : `+${req.msisdn}`,
      networkCode: this.opts.networkCode,
      text: req.input,
    })

    const res = await fetch(this.opts.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...this.opts.customHeaders,
      },
      body: body.toString(),
      signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    const text = (await res.text()).trim()
    return this.parseAfricasTalkingResponse(text, req.sessionId)
  }

  private parseAfricasTalkingResponse(raw: string, sessionId: string): UssdResponse {
    if (raw.startsWith('CON ')) {
      return { type: 'CON', message: raw.slice(4), sessionId }
    }
    if (raw.startsWith('END ')) {
      return { type: 'END', message: raw.slice(4), sessionId }
    }
    // Lenient: no prefix → treat as END
    return { type: 'END', message: raw, sessionId }
  }

  reset(): void {
    // Stateless from client side; no-op
  }

  updateOptions(opts: Partial<HttpAdapterOptions>): void {
    this.opts = { ...this.opts, ...opts }
  }
}
