import { useMemo } from 'react'
import type { Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'

export interface SearchResult {
  recipe: Recipe
  matchRate: number          // 0-1
  missingCount: number
  substitutableCount: number // ingredients resolvable via substitution
  isPerfect: boolean         // matchRate === 1
}

export interface GroupedResults {
  perfect: SearchResult[]
  near: SearchResult[]
  partial: SearchResult[]
}

/** Frequency count of each ingredient name across all recipes */
function buildIngredientFrequencies(): Map<string, number> {
  const freq = new Map<string, number>()
  for (const r of RECIPES) {
    for (const ing of r.ingredients) {
      freq.set(ing.nameZh, (freq.get(ing.nameZh) ?? 0) + 1)
    }
  }
  return freq
}

/** Top N most frequent ingredients */
export function getTopIngredients(n: number): string[] {
  const freq = buildIngredientFrequencies()
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name)
}

/** All unique ingredient names across all recipes (for autocomplete) */
export function getAllIngredientNames(): string[] {
  const names = new Set<string>()
  for (const r of RECIPES) {
    for (const ing of r.ingredients) {
      names.add(ing.nameZh)
    }
  }
  return [...names]
}

export function useIngredientSearch(
  ingredients: string[],
  preferenceScores?: Map<string, number>,
): GroupedResults {
  return useMemo(() => {
    if (ingredients.length === 0) return { perfect: [], near: [], partial: [] }

    const results: SearchResult[] = []

    for (const recipe of RECIPES) {
      let hits = 0
      let substitutable = 0
      const total = recipe.ingredients.length

      for (const ing of recipe.ingredients) {
        // Direct match
        if (ingredients.some((u) => u === ing.nameZh || u === ing.nameEn)) {
          hits++
          continue
        }
        // Substitution match: user has the substitution ingredient
        if (
          ing.substitution &&
          ingredients.some((u) => u === ing.substitution!.nameZh || u === ing.substitution!.nameEn)
        ) {
          hits++
          substitutable++
          continue
        }
      }

      const matchRate = hits / total
      results.push({
        recipe,
        matchRate,
        missingCount: total - hits,
        substitutableCount: substitutable,
        isPerfect: matchRate === 1,
      })
    }

    // Sort: matchRate DESC → preference score DESC
    results.sort((a, b) => {
      if (b.matchRate !== a.matchRate) return b.matchRate - a.matchRate
      if (preferenceScores) {
        const scoreA = preferenceScores.get(a.recipe.id) ?? 0.5
        const scoreB = preferenceScores.get(b.recipe.id) ?? 0.5
        if (scoreB !== scoreA) return scoreB - scoreA
      }
      return a.recipe.nameZh.localeCompare(b.recipe.nameZh, 'zh')
    })

    return {
      perfect: results.filter((r) => r.matchRate === 1),
      near: results.filter((r) => r.matchRate >= 0.6 && r.matchRate < 1),
      partial: results.filter((r) => r.matchRate < 0.6),
    }
  }, [ingredients, preferenceScores])
}
