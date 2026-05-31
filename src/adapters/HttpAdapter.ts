import type { UssdAdapter, UssdRequest, UssdResponse } from '@/types/ussd'

export class HttpAdapter implements UssdAdapter {
  private endpointUrl: string

  constructor(endpointUrl: string) {
    this.endpointUrl = endpointUrl
  }

  async send(req: UssdRequest): Promise<UssdResponse> {
    const res = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const data = await res.json() as UssdResponse
    return data
  }

  reset(): void {
    // HTTP sessions are stateless from the client side; no-op
  }

  updateEndpoint(url: string): void {
    this.endpointUrl = url
  }
}
