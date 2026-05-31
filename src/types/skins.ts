export type PhoneSkin = 'slate' | 'midnight' | 'rose' | 'forest' | 'sand'

export interface SkinConfig {
  label: string
  body: string
  bezel: string
  grille: string
  indicator: string
}

export const SKINS: Record<PhoneSkin, SkinConfig> = {
  slate: {
    label: 'Slate',
    body: 'bg-gray-800',
    bezel: 'bg-gray-900',
    grille: 'bg-gray-700',
    indicator: 'bg-gray-600',
  },
  midnight: {
    label: 'Midnight',
    body: 'bg-blue-950',
    bezel: 'bg-slate-900',
    grille: 'bg-blue-900',
    indicator: 'bg-blue-800',
  },
  rose: {
    label: 'Rose',
    body: 'bg-rose-950',
    bezel: 'bg-rose-900',
    grille: 'bg-rose-800',
    indicator: 'bg-rose-700',
  },
  forest: {
    label: 'Forest',
    body: 'bg-green-950',
    bezel: 'bg-green-900',
    grille: 'bg-green-800',
    indicator: 'bg-green-700',
  },
  sand: {
    label: 'Sand',
    body: 'bg-amber-800',
    bezel: 'bg-amber-900',
    grille: 'bg-amber-700',
    indicator: 'bg-amber-600',
  },
}
