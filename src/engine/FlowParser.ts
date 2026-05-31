import { z } from 'zod'
import type { FlowDefinition } from '@/types/ussd'

const FlowMenuOptionSchema = z.object({
  next: z.string().optional(),
  action: z.string().optional(),
  message: z.string().optional(),
})

const FlowMenuSchema = z.object({
  text: z.string(),
  type: z.enum(['CON', 'END']).optional(),
  action: z.string().optional(),
  options: z.record(z.string(), FlowMenuOptionSchema).optional(),
})

const FlowDefinitionSchema = z.object({
  startMenu: z.string(),
  menus: z.record(z.string(), FlowMenuSchema),
})

export interface ParseResult {
  ok: boolean
  flow?: FlowDefinition
  errors: string[]
}

export function parseFlow(raw: unknown): ParseResult {
  const result = FlowDefinitionSchema.safeParse(raw)

  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
    }
  }

  const flow = result.data as FlowDefinition
  const errors: string[] = []

  if (!(flow.startMenu in flow.menus)) {
    errors.push(`startMenu "${flow.startMenu}" is not defined in menus`)
  }

  for (const [key, menu] of Object.entries(flow.menus)) {
    if (menu.options) {
      for (const [opt, target] of Object.entries(menu.options)) {
        if (target.next && !(target.next in flow.menus)) {
          errors.push(`Menu "${key}" option "${opt}" points to undefined menu "${target.next}"`)
        }
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, flow, errors: [] }
}

export function parseFlowJson(json: string): ParseResult {
  try {
    const raw: unknown = JSON.parse(json)
    return parseFlow(raw)
  } catch {
    return { ok: false, errors: ['Invalid JSON: could not parse input'] }
  }
}
