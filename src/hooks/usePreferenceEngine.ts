import { useCallback, useMemo } from 'react'
import { RECIPES } from '../data/recipes'
import type { Recipe, PreferenceProfile, ActionType, Category } from '../data/types'
import { useStoredState } from './useStoredState'

/* ── Constants ─────────────────────────────────────────────── */

const LEARNING_RATE = 0.12
const DECAY_INTERVAL_MS = 7 * 24 * 3600 * 1000 // 7 days
const DECAY_FACTOR = 0.85

const ACTION_WEIGHTS: Record<ActionType, number> = {
  view: 0.4,
  favorite: 1.0,
  unfavorite: -0.6,
  cook: 0.8,
  cart: 0.2,
}

const INITIAL_FLAVOR = { acid: 0.5, sweet: 0.5, bitter: 0.5, spicy: 0.5, salty: 0.5, umami: 0.5 }

function makeInitialProfile(): PreferenceProfile {
  return {
    flavor: { ...INITIAL_FLAVOR },
    categories: { chinese: 0, western: 0, drink: 0, basic: 0 },
    timePreference: [0, 0, 0],
    difficultyPreference: [0, 0, 0],
    totalInteractions: 0,
    lastUpdated: Date.now(),
  }
}

/* ── Helpers ────────────────────────────────────────────────── */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function recipeTimeIdx(recipe: Recipe): number {
  const t = parseInt(recipe.prepTime, 10)
  if (t <= 15) return 0
  if (t <= 30) return 1
  return 2
}

function recipeDiffIdx(recipe: Recipe): number {
  if (recipe.difficulty === 'easy') return 0
  if (recipe.difficulty === 'medium') return 1
  return 2
}

function applyDecay(profile: PreferenceProfile): PreferenceProfile {
  if (Date.now() - profile.lastUpdated <= DECAY_INTERVAL_MS) return profile
  const weeks = (Date.now() - profile.lastUpdated) / DECAY_INTERVAL_MS
  const decay = Math.pow(DECAY_FACTOR, weeks)
  const cats = { ...profile.categories } as Record<Category, number>
  for (const k of Object.keys(cats) as Category[]) {
    cats[k] = profile.categories[k] * decay
  }
  return {
    ...profile,
    categories: cats as PreferenceProfile['categories'],
    timePreference: profile.timePreference.map((v) => v * decay) as [number, number, number],
    difficultyPreference: profile.difficultyPreference.map((v) => v * decay) as [number, number, number],
  }
}

function euclideanDistance(a: { acid: number; sweet: number; bitter: number; spicy: number; salty: number; umami: number }, b: { acid: number; sweet: number; bitter: number; spicy: number; salty: number; umami: number }): number {
  return Math.sqrt(
    (a.acid - b.acid) ** 2 + (a.sweet - b.sweet) ** 2 +
    (a.bitter - b.bitter) ** 2 + (a.spicy - b.spicy) ** 2 +
    (a.salty - b.salty) ** 2 + (a.umami - b.umami) ** 2,
  )
}

function max3(arr: [number, number, number]): number {
  return Math.max(arr[0], arr[1], arr[2])
}

/* ── Hook ───────────────────────────────────────────────────── */

export function usePreferenceEngine() {
  const [profile, setProfile] = useStoredState<PreferenceProfile>(
    'preferenceProfile',
    makeInitialProfile(),
  )

  const record = useCallback((recipe: Recipe, action: ActionType) => {
    setProfile((prev) => {
      // 1. Apply time decay
      const p = applyDecay(prev)
      const weight = ACTION_WEIGHTS[action]

      // 2. Compute alpha (signed)
      const alpha = weight * LEARNING_RATE

      // 3. Update flavor vector with clamping
      const flavor = { ...p.flavor }
      const fp = recipe.flavorProfile
      ;(Object.keys(flavor) as (keyof typeof flavor)[]).forEach((dim) => {
        flavor[dim] = clamp(flavor[dim] * (1 - alpha) + fp[dim] * alpha, 0, 1)
      })

      // 4-6. Update counters with floor at 0
      const categories = { ...p.categories }
      categories[recipe.category] = Math.max(0, categories[recipe.category] + weight)

      const timePref = [...p.timePreference] as [number, number, number]
      timePref[recipeTimeIdx(recipe)] = Math.max(0, timePref[recipeTimeIdx(recipe)] + weight)

      const diffPref = [...p.difficultyPreference] as [number, number, number]
      diffPref[recipeDiffIdx(recipe)] = Math.max(0, diffPref[recipeDiffIdx(recipe)] + weight)

      return {
        flavor,
        categories,
        timePreference: timePref,
        difficultyPreference: diffPref,
        totalInteractions: p.totalInteractions + 1,
        lastUpdated: Date.now(),
      }
    })
  }, [setProfile])

  const scoreRecipe = useCallback((recipe: Recipe): number => {
    // Cold start: return neutral
    if (profile.totalInteractions < 3) return 0.5

    // Prepare profile with virtual decay
    const p = applyDecay(profile)

    const flavorScore = 1 - euclideanDistance(recipe.flavorProfile, p.flavor) / Math.sqrt(6)

    const maxCat = Math.max(...Object.values(p.categories) as number[])
    const categoryScore = maxCat > 0 ? p.categories[recipe.category] / maxCat : 0

    const maxTime = max3(p.timePreference)
    const timeScore = maxTime > 0 ? p.timePreference[recipeTimeIdx(recipe)] / maxTime : 0

    const maxDiff = max3(p.difficultyPreference)
    const difficultyScore = maxDiff > 0 ? p.difficultyPreference[recipeDiffIdx(recipe)] / maxDiff : 0

    const finalScore = 0.55 * flavorScore + 0.20 * categoryScore + 0.15 * timeScore + 0.10 * difficultyScore

    // Ramp: 3-10 interactions linearly scales from 20% to 100% weight
    if (profile.totalInteractions < 10) {
      const ramp = 0.2 + (0.8 * (profile.totalInteractions - 3)) / 7
      return 0.5 + (finalScore - 0.5) * ramp
    }
    return finalScore
  }, [profile])

  const scoreAll = useCallback((recipes: Recipe[]): Map<string, number> => {
    const map = new Map<string, number>()
    for (const r of recipes) {
      map.set(r.id, scoreRecipe(r))
    }
    return map
  }, [scoreRecipe])

  const generateTags = useCallback((lang: 'zh' | 'en'): string[] => {
    if (profile.totalInteractions < 3) return []
    const p = applyDecay(profile)
    const tags: string[] = []

    // Flavor tags (highest priority)
    if (p.flavor.spicy > 0.65) tags.push(lang === 'zh' ? '嗜辣' : 'Spicy Lover')
    if (p.flavor.sweet > 0.65) tags.push(lang === 'zh' ? '偏甜' : 'Sweet Tooth')
    if (p.flavor.umami > 0.65) tags.push(lang === 'zh' ? '爱鲜' : 'Umami Fan')
    if (p.flavor.acid > 0.65) tags.push(lang === 'zh' ? '嗜酸' : 'Sour Fan')
    if (p.flavor.bitter > 0.65) tags.push(lang === 'zh' ? '能吃苦' : 'Bitter OK')

    // Category tag
    const cats = Object.entries(p.categories) as [Category, number][]
    cats.sort((a, b) => b[1] - a[1])
    if (cats[0][1] > 0) {
      const topCat = cats[0][0]
      const catLabels: Record<Category, { zh: string; en: string }> = {
        chinese: { zh: '中餐党', en: 'Chinese Food' },
        western: { zh: '西餐控', en: 'Western Food' },
        drink: { zh: '饮品控', en: 'Drink Lover' },
        basic: { zh: '', en: '' }, // basic category gets no tag
      }
      if (topCat !== 'basic') {
        tags.push(lang === 'zh' ? catLabels[topCat].zh : catLabels[topCat].en)
      }
    }

    // Time tag
    if (p.timePreference[0] >= p.timePreference[1] && p.timePreference[0] >= p.timePreference[2] && p.timePreference[0] > 0) {
      tags.push(lang === 'zh' ? '快手菜' : 'Quick Meals')
    } else if (p.timePreference[2] >= p.timePreference[0] && p.timePreference[2] >= p.timePreference[1] && p.timePreference[2] > 0) {
      tags.push(lang === 'zh' ? '慢炖党' : 'Slow Cooking')
    }

    if (tags.length === 0) {
      tags.push(lang === 'zh' ? '探索中' : 'Exploring')
    }

    return tags.slice(0, 4)
  }, [profile])

  const reset = useCallback(() => {
    setProfile(makeInitialProfile())
  }, [setProfile])

  return useMemo(() => ({
    profile,
    record,
    scoreRecipe,
    scoreAll,
    generateTags,
    reset,
  }), [profile, record, scoreRecipe, scoreAll, generateTags, reset])
}
