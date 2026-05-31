import { UssdEngine } from '@/engine/UssdEngine'
import type { FlowDefinition, UssdAdapter, UssdRequest, UssdResponse } from '@/types/ussd'

export class MockAdapter implements UssdAdapter {
  private engine: UssdEngine
  private delayMs: number

  constructor(flow: FlowDefinition, delayMs = 300) {
    this.engine = new UssdEngine(flow)
    this.delayMs = delayMs
  }

  async send(req: UssdRequest): Promise<UssdResponse> {
    await this.delay()
    return this.engine.process(req)
  }

  reset(): void {
    this.engine.reset()
  }

  setDelay(ms: number): void {
    this.delayMs = ms
  }

  updateFlow(flow: FlowDefinition): void {
    this.engine = new UssdEngine(flow)
  }

  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delayMs))
  }
}
