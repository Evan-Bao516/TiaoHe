# Flavor Preference Learning System — Design Spec

**Date**: 2026-06-18  
**Status**: Approved  
**Project**: TiaoHe (调和) Cooking Lab PWA

## Overview

Replace the current manual preference picker with an automatic learning system that observes user behavior (viewing, favoriting, cooking, cart interactions) and builds a multi-dimensional preference profile. This profile drives global smart sorting across all recipe lists, with semi-transparent preference tags visible to the user.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Behavior signals | All actions, weighted | Favoriting alone is too sparse; viewing adds volume; cooking in FocusMode is high-intent |
| UI integration | Global smart sorting | Preference should improve every list, not just a single feed |
| Transparency | Semi-transparent | Show tags, allow reset; no radar chart (keeps UI clean, avoids overwhelming) |
| Learning algorithm | EMA vector + category/time/difficulty counters | Maps directly to existing `FlavorProfile`/`Category`/`Difficulty` types; O(n) scoring |

## Data Model

### PreferenceProfile

```typescript
interface PreferenceProfile {
  flavor: FlavorPreference          // 6-dim EMA vector, each 0-1
  categories: CategoryPreference    // weighted counts per category
  timePreference: [number, number, number]   // [fast, medium, long]
  difficultyPreference: [number, number, number] // [easy, medium, hard]
  totalInteractions: number         // for cold-start gating
  lastUpdated: number               // epoch ms
}
```

### ActionType

```typescript
type ActionType = 'view' | 'favorite' | 'unfavorite' | 'cook' | 'cart'
```

### Initial Profile Factory

```
INITIAL_PROFILE = {
  flavor: { acid: 0.5, sweet: 0.5, bitter: 0.5, spicy: 0.5, salty: 0.5, umami: 0.5 },
  categories: { chinese: 0, western: 0, drink: 0, basic: 0 },
  timePreference: [0, 0, 0],
  difficultyPreference: [0, 0, 0],
  totalInteractions: 0,
  lastUpdated: Date.now()
}
```

All dimensions start at 0.5 (neutral). Counters start at 0. `totalInteractions < 3` gates cold start.

### Action Weights

| Action | Weight | Trigger |
|--------|--------|---------|
| Favorite | +1.0 | Toggle favorite → true |
| Cook (FocusMode) | +0.8 | FocusMode exit, `completionRatio > 0.5` |
| View detail | +0.4 | Navigate to recipe detail (from browse or search — same weight) |
| Add to cart | +0.2 | Add ingredient to cart |
| Unfavorite | -0.6 | Toggle favorite → false |

Search → click is tracked as a normal view. The search intent is already captured by the view weight; a separate action adds complexity without meaningful signal differentiation.

## Learning Engine

### Write Path: Record Interaction

When an interaction occurs:

```
recordInteraction(profile, recipe, actionWeight):
  1. Apply time decay to counters (see below)
  2. Compute α = actionWeight × 0.12
     // α is signed: positive for favorite/view/cook/cart, negative for unfavorite
  3. flavor[each dim] = clamp(flavor[dim] × (1 - α) + recipe.flavorProfile[dim] × α, 0, 1)
  4. categories[recipe.category] = max(0, categories[recipe.category] + actionWeight)
  5. timePref[recipeTimeIdx]      = max(0, timePref[recipeTimeIdx] + actionWeight)
  6. diffPref[recipeDiffIdx]      = max(0, diffPref[recipeDiffIdx] + actionWeight)
  7. totalInteractions += 1
  8. lastUpdated = now
```

Steps 1-2 ensure decay is materialized before new weights are added, preventing double-decay.
Step 3 clamps flavor to [0,1] — negative α from unfavorite moves the vector away from the recipe, but never outside valid range.
Steps 4-6 floor counters at 0 — unfavorite cannot make a category count negative.

### Read Path: Score & Tags

On every read (scoring or tag generation), apply time decay virtually before computing:

```
prepareProfile(profile):
  if now - profile.lastUpdated > 7 days:
    weeks = (now - lastUpdated) / (7 × 24 × 3600 × 1000)
    decay = 0.85 ^ weeks
    // Apply decay to working copy only (stored profile is decayed on next write)
    categories[each]     *= decay
    timePref[each]       *= decay
    diffPref[each]       *= decay
  return prepared profile
```

Decay schedule: 1 week idle → 85% retained, 2 weeks → 72%, 4 weeks → 52%. Active use keeps `lastUpdated` current and halts decay.

Note: Flavor vector does NOT decay on its own. EMA only moves when new interactions occur, so flavor preferences are persistent — you don't "forget" that you like spicy food. Category/time/difficulty counters decay because they represent contextual habits (e.g., a health kick last month) rather than stable preferences.

### Cold Start

- `totalInteractions < 3`: engine returns `finalScore = 0.5` for all recipes; existing sort behavior preserved
- `3 ≤ totalInteractions < 10`: preference weight ramps linearly from 20% to 100%

### Recipe Index Mapping

```
recipeTimeIdx:  parseInt(prepTime) ≤ 15 → 0, ≤ 30 → 1, > 30 → 2
recipeDiffIdx:  easy → 0, medium → 1, hard → 2
```

### Scoring Formula

```
flavorScore     = 1 - euclidean(recipe.flavor, preparedProfile.flavor) / √6

// Zero-division guards:
categoryScore   = max(preparedProfile.categories) > 0
                  ? preparedProfile.categories[recipe.category] / max(preparedProfile.categories)
                  : 0
timeScore       = max(preparedProfile.timePref) > 0
                  ? preparedProfile.timePref[recipeTimeIdx] / max(preparedProfile.timePref)
                  : 0
difficultyScore = max(preparedProfile.diffPref) > 0
                  ? preparedProfile.diffPref[recipeDiffIdx] / max(preparedProfile.diffPref)
                  : 0

finalScore = 0.55 × flavorScore
           + 0.20 × categoryScore
           + 0.15 × timeScore
           + 0.10 × difficultyScore
```

### Sort Strategy

| Context | Behavior |
|---------|----------|
| Discover — scenes | Unchanged (static curated lists, no preference sort) |
| Discover — "推荐" section | Top 5 by `finalScore`, 3 high-score + 2 exploration |
| Browse tab (category view) | Default sort by `finalScore` desc; toggle to A-Z |
| Browse with active filter | Sort within filtered results by `finalScore` desc |
| Search results | Sort within results by `finalScore` desc |
| Favorites view | Sort by `finalScore` desc |
| Manual preference active | Manual filters override all auto-sort |
| Blind box | Random from top 50% by `finalScore` (`prefMatches` when manual prefs active) |

### Exploration Injection (Filter Bubble Prevention)

Pure preference sorting risks filter bubbles — the more spicy food the user sees, the spicier the recommendations get, and mild dishes vanish.

Discover "推荐" section (5 items): **3 high-score + 2 exploration**.

Exploration candidates are recipes with `flavorScore < 0.5` (far from current profile), shuffled. Displayed with a "🌱 尝鲜" / "🌱 Explore" label. If fewer than 2 qualifying exploration candidates exist, fill remaining slots with high-score items.

This only applies to Discover recommendations. Browse and search remain pure preference sorting — user intent is explicit there.

## UI Changes

### PreferenceBar (new component, ~50 lines)

Placed in Discover tab above scene sections. Hidden during cold start (`totalInteractions < 3`). Once active, shows 2-4 auto-generated tags:

```
🧬 你的口味 · 嗜辣 · 快手菜 · 中餐党  [重置]
```

Tag generation (internationalized via `lang` param):

| Condition | zh | en |
|-----------|----|----|
| `spicy > 0.65` | 嗜辣 | Spicy Lover |
| `sweet > 0.65` | 偏甜 | Sweet Tooth |
| `umami > 0.65` | 爱鲜 | Umami Fan |
| `acid > 0.65` | 嗜酸 | Sour Fan |
| `bitter > 0.65` | 能吃苦 | Bitter OK |
| `timePref[0]` dominant | 快手菜 | Quick Meals |
| `timePref[2]` dominant | 慢炖党 | Slow Cooking |
| `categories.chinese` dominant | 中餐党 | Chinese Food |
| `categories.western` dominant | 西餐控 | Western Food |
| `categories.drink` dominant | 饮品控 | Drink Lover |

Priority: flavor tags first, then category, then time. Max 4 displayed. If no tag qualifies (all near neutral), show "探索中" / "Exploring".

Reset button shows confirmation toast; clears profile back to `INITIAL_PROFILE`.

### RecipeList changes

- `filtered` useMemo: default sort changes from `localeCompare(nameZh)` to `finalScore` desc
- New `sortMode` state: `'preference' | 'alphabetical'`. Toggle button in list header: `▸ 按口味推荐 ↑` / `▸ 按名称 A-Z ↑`
- Manual preference picker: a hint line appears below the picker button when picker is collapsed and auto-sort is active: `💡 已根据你的口味自动排序。手动设置将覆盖自动偏好。`
- **Discover "推荐" section**: simplified from 3-source merge (`recentRecipes` + `flavorSimilar` + `suggestedRecipes`) to a single list of top 5 by `finalScore` (from `recipeScores` prop), excluding already-viewed recipes. 3 high-score + 2 exploration. Removes the `flavorSimilar` and `suggestedRecipes` useMemos.

### RecipeCard micro-indicator

New optional prop: `matchScore?: number`.

Top-right corner: small dot overlay:
- `matchScore > 0.8`: 6px green dot (`#10B981`)
- `0.5 < matchScore ≤ 0.8`: 6px dim dot (`rgba(0,229,255,0.2)`)
- `≤ 0.5` or undefined: no indicator

### App.tsx wiring

`usePreferenceEngine()` called in App.tsx. Derived data flows to children as props.

Interaction recording:
- `handleSelectRecipe` → `engine.record(recipe, 'view')`
- `handleToggleFavorite` → `engine.record(recipe, fav ? 'favorite' : 'unfavorite')`
- `handleAddToCart` → `engine.record(recipe, 'cart')`

FocusMode gets a new optional prop:
```
onComplete?: (completionRatio: number) => void
```
Fired on exit. Ratio = `(activeStep + 1) / steps.length`. App.tsx: `if (ratio > 0.5) engine.record(selectedRecipe, 'cook')`.

Data flow to children:
- `RecipeList` receives `recipeScores: Map<string, number>` (from `engine.scoreAll(RECIPES)`)
- `PreferenceBar` receives `tags: string[]` (from `engine.generateTags(lang)`) and `onReset: () => void`
- `RecipeCard` receives `matchScore?: number` (looked up from `recipeScores`)

### FocusMode changes

Minimal: new optional `onComplete` prop. On exit (both manual exit and last-step completion), call `onComplete?.((activeStep + 1) / steps.length)`. All existing behavior preserved.

## API Surface

### usePreferenceEngine hook

```typescript
function usePreferenceEngine(): {
  profile: PreferenceProfile
  record: (recipe: Recipe, action: ActionType) => void
  scoreRecipe: (recipe: Recipe) => number        // returns finalScore
  scoreAll: (recipes: Recipe[]) => Map<string, number>  // batch scoring
  generateTags: (lang: 'zh' | 'en') => string[]
  reset: () => void
}
```

## Files

| File | Action | Description |
|------|--------|-------------|
| `src/data/types.ts` | Modify | Add `PreferenceProfile`, `ActionType`, `FlavorPreference` |
| `src/hooks/usePreferenceEngine.ts` | **New** | Core engine (~150 lines): profile, record, score, tags, reset |
| `src/components/PreferenceBar.tsx` | **New** | Preference tag bar for Discover (~50 lines) |
| `src/components/RecipeList.tsx` | Modify | Global sort, sort toggle, simplified Discover 推荐, exploration injection |
| `src/components/RecipeCard.tsx` | Modify | `matchScore` prop + indicator dot |
| `src/components/FocusMode.tsx` | Modify | `onComplete` callback |
| `src/App.tsx` | Modify | Wire interactions, pass profile/engine to children |

## Persistence

- localStorage key: `cooking-lab:preferenceProfile`
- Format: JSON-serialized `PreferenceProfile`
- Size: ~200 bytes
- Reuses existing `useStoredState` pattern

## Non-Breaking Guarantees

- All existing component props remain (new ones are optional)
- Manual preference picker fully preserved as override
- `totalInteractions < 3` → system silent, experience unchanged
- A-Z sort toggle always available
- Reset clears everything to `INITIAL_PROFILE`
- Profile is **never modified during reads** — only writes mutate stored state
