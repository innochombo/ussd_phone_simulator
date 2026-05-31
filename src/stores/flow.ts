import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { parseFlowJson } from '@/engine/FlowParser'
import type { FlowDefinition } from '@/types/ussd'

const DEFAULT_FLOW: FlowDefinition = {
  startMenu: 'main',
  menus: {
    main: {
      text: 'Welcome to USSD Simulator\n1. Check balance\n2. Send money\n3. My account\n0. Exit',
      options: {
        '1': { next: 'balance' },
        '2': { next: 'send_prompt' },
        '3': { next: 'account' },
        '0': { action: 'end', message: 'Thank you. Goodbye.' },
      },
    },
    balance: {
      text: 'Your balance is MWK 4,250.00\n\n0. Back to main menu',
      options: {
        '0': { next: 'main' },
      },
    },
    send_prompt: {
      text: 'Send Money\nEnter recipient number:',
      options: {
        default: { next: 'send_amount' },
      },
    },
    send_amount: {
      text: 'Enter amount to send:',
      options: {
        default: { next: 'send_confirm' },
      },
    },
    send_confirm: {
      text: 'Confirm send?\n1. Confirm\n2. Cancel',
      options: {
        '1': { next: 'send_success' },
        '2': { next: 'main' },
      },
    },
    send_success: {
      text: 'Money sent successfully.',
      type: 'END',
    },
    account: {
      text: 'My Account\n1. Change PIN\n2. Notifications\n0. Back',
      options: {
        '1': { next: 'change_pin' },
        '2': { next: 'notifications' },
        '0': { next: 'main' },
      },
    },
    change_pin: {
      text: 'PIN change coming soon.',
      type: 'END',
    },
    notifications: {
      text: 'Notifications: ON\n\n1. Turn OFF\n0. Back',
      options: {
        '1': { next: 'notifications_off' },
        '0': { next: 'account' },
      },
    },
    notifications_off: {
      text: 'Notifications turned off.',
      type: 'END',
    },
  },
}

export const useFlowStore = defineStore('flow', () => {
  const flow = shallowRef<FlowDefinition>(DEFAULT_FLOW)
  const flowName = ref('Default Demo Flow')
  const validationErrors = ref<string[]>([])
  const rawJson = ref(JSON.stringify(DEFAULT_FLOW, null, 2))

  function loadFromJson(json: string): boolean {
    const result = parseFlowJson(json)
    if (result.ok && result.flow) {
      flow.value = result.flow
      rawJson.value = json
      validationErrors.value = []
      return true
    }
    validationErrors.value = result.errors
    return false
  }

  function loadDefault() {
    flow.value = DEFAULT_FLOW
    rawJson.value = JSON.stringify(DEFAULT_FLOW, null, 2)
    flowName.value = 'Default Demo Flow'
    validationErrors.value = []
  }

  function setFlowName(name: string) {
    flowName.value = name
  }

  return {
    flow,
    flowName,
    validationErrors,
    rawJson,
    loadFromJson,
    loadDefault,
    setFlowName,
  }
})
