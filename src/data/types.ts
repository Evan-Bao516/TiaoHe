/* ──────────────────────────────────────────────────────────────────
   Shared type definitions for Cooking Lab
   ───────────────────────────────────────────────────────────────── */

/** Per-flavor-axis delta for substitution impact */
export interface FlavorDelta {
  acid?: number
  sweet?: number
  bitter?: number
  spicy?: number
  salty?: number
  umami?: number
}

export interface Ingredient {
  id: string
  nameZh: string
  nameEn: string
  amount: string
  substitution?: {
    nameZh: string
    nameEn: string
    flavorDelta: FlavorDelta
    tags: { label: string; variant: 'muted' | 'amber' }[]
  }
}

export interface Step {
  zh: string
  en: string
  duration: string
  detail: string
}

/** Flavor profile for the radar chart — 0–1 values per axis */
export interface FlavorProfile {
  acid: number
  sweet: number
  bitter: number
  spicy: number
  salty: number
  umami: number
}

/** Macronutrient distribution (percentages, should sum to 1) */
export interface Macros {
  protein: number
  fats: number
  carbs: number
}

export type Category = 'chinese' | 'western' | 'drink' | 'basic'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Recipe {
  id: string
  nameZh: string
  nameEn: string
  emoji: string
  accent: string          // hex color e.g. "#E85D3A"
  category: Category
  tags: string[]
  difficulty: Difficulty
  prepTime: string
  totalKcal: number
  macros: Macros
  flavorProfile: FlavorProfile
  ingredients: Ingredient[]
  steps: Step[]
}
