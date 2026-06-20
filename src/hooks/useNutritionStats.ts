import { useMemo } from 'react'
import type { NutritionStats } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useCookJournal } from './useCookJournal'

/* ─────────────────────────────────────────────────────────────
   Meta-data for cuisine categories (display name + chart color)
   ───────────────────────────────────────────────────────────── */
const CATEGORY_META: Record<string, { zh: string; en: string; color: string }> = {
  chinese: { zh: '中餐', en: 'Chinese', color: '#E85D3A' },
  western: { zh: '西餐', en: 'Western', color: '#4A90D9' },
  drink:   { zh: '饮品', en: 'Drinks', color: '#7B61FF' },
  basic:   { zh: '基础', en: 'Basics', color: '#6B7280' },
}

/** Format a Unix‑ms timestamp as YYYY‑MM‑DD */
function formatDate(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Number of calendar days covered by a [start, end] range (1‑based) */
function daysInRange(start: number, end: number): number {
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
}

/**
 * Aggregates CookEntry data from useCookJournal within the given
 * date range and returns a NutritionStats object suitable for dashboards.
 *
 * - Filters allEntries by [dateStart, dateEnd] (Unix ms, inclusive)
 * - Looks up each entry's recipe in RECIPES to obtain macros / kcal
 * - Handles missing recipes gracefully (skips kcal/macros for that entry)
 * - Returns zeros / empty arrays when no entries match the range
 */
export function useNutritionStats(
  dateStart: number,
  dateEnd: number,
): NutritionStats {
  const { allEntries } = useCookJournal()

  return useMemo((): NutritionStats => {
    /* ── Empty state ─────────────────────────────────────── */
    const empty: NutritionStats = {
      totalKcal: 0,
      avgKcalPerDay: 0,
      totalCookCount: 0,
      avgRating: 0,
      totalMinutes: 0,
      macros: { protein: 0, fats: 0, carbs: 0 },
      kcalTrend: [],
      cuisineDistribution: [],
      tagDistribution: [],
      topRecipes: [],
    }

    /* ── Filter by date range ────────────────────────────── */
    const filtered = allEntries.filter(
      (e) => e.date >= dateStart && e.date <= dateEnd,
    )
    if (filtered.length === 0) return empty

    /* ── Build recipe lookup ─────────────────────────────── */
    const recipeMap = new Map(RECIPES.map((r) => [r.id, r]))

    /* ── Aggregation accumulators ────────────────────────── */
    let totalKcal = 0
    let totalRating = 0
    let totalMinutes = 0
    const macroSums = { protein: 0, fats: 0, carbs: 0 }

    const dayMap      = new Map<string, number>() // date → kcal
    const cuisineCnt  = new Map<string, number>() // category → count
    const tagCnt      = new Map<string, number>() // tag → count
    const recipeFreq  = new Map<string, number>() // recipeId → count

    for (const entry of filtered) {
      const recipe = recipeMap.get(entry.recipeId)

      /* Kcal & macros (only when recipe is known) */
      if (recipe) {
        totalKcal += recipe.totalKcal
        macroSums.protein += recipe.macros.protein
        macroSums.fats    += recipe.macros.fats
        macroSums.carbs   += recipe.macros.carbs
      }

      totalRating  += entry.rating
      totalMinutes += entry.actualTime

      /* Daily kcal trend (aggregate by calendar day) */
      const dayKey = formatDate(entry.date)
      dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + (recipe?.totalKcal ?? 0))

      /* Cuisine distribution */
      if (recipe) {
        cuisineCnt.set(recipe.category, (cuisineCnt.get(recipe.category) ?? 0) + 1)
      }

      /* Custom tag distribution */
      for (const tag of entry.customTags) {
        tagCnt.set(tag, (tagCnt.get(tag) ?? 0) + 1)
      }

      /* Recipe frequency for top‑recipes */
      recipeFreq.set(entry.recipeId, (recipeFreq.get(entry.recipeId) ?? 0) + 1)
    }

    const count = filtered.length

    /* ── Kcal trend (sorted by date ascending) ───────────── */
    const kcalTrend = [...dayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, kcal]) => ({ date, kcal }))

    /* ── Cuisine distribution (sorted by count desc) ─────── */
    const cuisineDistribution = [...cuisineCnt.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([cat, cnt]) => {
        const meta = CATEGORY_META[cat]
        return {
          category: cat,
          name: meta?.zh ?? cat,
          nameEn: meta?.en ?? cat,
          count: cnt,
          color: meta?.color ?? '#9CA3AF',
        }
      })

    /* ── Tag distribution (sorted by count desc) ─────────── */
    const tagDistribution = [...tagCnt.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([tag, cnt]) => ({ tag, count: cnt }))

    /* ── Top 5 recipes (sorted by frequency desc) ────────── */
    const topRecipes = [...recipeFreq.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([recipeId, cnt]) => ({ recipeId, count: cnt }))

    /* ── Average kcal per day over the full range ────────── */
    const numDays = daysInRange(dateStart, dateEnd)

    return {
      totalKcal,
      avgKcalPerDay: Math.round((totalKcal / numDays) * 100) / 100,
      totalCookCount: count,
      avgRating: Math.round((totalRating / count) * 10) / 10,
      totalMinutes,
      macros: {
        protein: Math.round(macroSums.protein * 100) / 100,
        fats:    Math.round(macroSums.fats * 100) / 100,
        carbs:   Math.round(macroSums.carbs * 100) / 100,
      },
      kcalTrend,
      cuisineDistribution,
      tagDistribution,
      topRecipes,
    }
  }, [allEntries, dateStart, dateEnd])
}
