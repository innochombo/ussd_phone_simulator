import type { FlowDefinition, UssdRequest, UssdResponse } from '@/types/ussd'

export class UssdEngine {
  private flow: FlowDefinition
  private currentMenu: string
  private variables: Record<string, string> = {}

  constructor(flow: FlowDefinition) {
    this.flow = flow
    this.currentMenu = flow.startMenu
  }

  reset(): void {
    this.currentMenu = this.flow.startMenu
    this.variables = {}
  }

  process(req: UssdRequest): UssdResponse {
    const menu = this.flow.menus[this.currentMenu]

    if (!menu) {
      return {
        type: 'END',
        message: 'Session error: menu not found.',
        sessionId: req.sessionId,
      }
    }

    const isInitialRequest = req.input === ''

    if (isInitialRequest) {
      const text = this.interpolate(menu.text)
      const type = menu.type === 'END' ? 'END' : 'CON'
      return { type, message: text, sessionId: req.sessionId }
    }

    if (!menu.options) {
      return {
        type: 'END',
        message: 'Session ended.',
        sessionId: req.sessionId,
      }
    }

    const selection = req.input.trim()
    const option = menu.options[selection]

    if (!option) {
      const text = `Invalid selection.\n\n${this.interpolate(menu.text)}`
      return { type: 'CON', message: text, sessionId: req.sessionId }
    }

    if (option.action === 'end') {
      return {
        type: 'END',
        message: option.message ?? 'Goodbye.',
        sessionId: req.sessionId,
      }
    }

    if (option.next) {
      const nextMenu = this.flow.menus[option.next]
      if (!nextMenu) {
        return {
          type: 'END',
          message: 'Session error: next menu not found.',
          sessionId: req.sessionId,
        }
      }
      this.currentMenu = option.next
      const text = this.interpolate(nextMenu.text)
      const type = nextMenu.type === 'END' ? 'END' : 'CON'
      return { type, message: text, sessionId: req.sessionId }
    }

    return {
      type: 'END',
      message: option.message ?? 'Session ended.',
      sessionId: req.sessionId,
    }
  }

  private interpolate(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => this.variables[key] ?? `{{${key}}}`)
  }

  setVariable(key: string, value: string): void {
    this.variables[key] = value
  }

  getCurrentMenu(): string {
    return this.currentMenu
  }
}
