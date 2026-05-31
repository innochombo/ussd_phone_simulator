export type ResponseType = 'CON' | 'END'

export type SessionStatus = 'IDLE' | 'DIALING' | 'ACTIVE' | 'END' | 'TIMEOUT' | 'ERROR'

export interface UssdRequest {
  msisdn: string
  serviceCode: string
  input: string
  sessionId: string
}

export interface UssdResponse {
  type: ResponseType
  message: string
  sessionId: string
}

export interface SessionLogEntry {
  id: string
  timestamp: number
  direction: 'OUT' | 'IN'
  content: string
  type?: ResponseType
}

export interface FlowMenuOption {
  next?: string
  action?: 'end' | string
  message?: string
}

export interface FlowMenu {
  text: string
  type?: 'CON' | 'END'
  action?: string
  options?: Record<string, FlowMenuOption>
}

export interface FlowDefinition {
  startMenu: string
  menus: Record<string, FlowMenu>
}

export interface UssdAdapter {
  send(req: UssdRequest): Promise<UssdResponse>
  reset(): void
}
