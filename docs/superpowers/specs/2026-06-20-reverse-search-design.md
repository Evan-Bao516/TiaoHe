# Reverse Search — Design Spec

**Date:** 2026-06-20
**Status:** approved
**Depends on:** M1-M2 modules, Preference Learning Engine, Cooking Journal

## Overview

Add a Reverse Search module that lets users find recipes by typing ingredients they have on hand ("I have chicken, eggs, onions — what can I make?"). Results are grouped by match completeness and sorted by match rate + preference score. Integrates with the existing fridge inventory: found recipes can be one-tap added to inventory.

## Data Flow

```
user inputs ingredients (text autocomplete + quick-tap chips)
       │
       ▼
  useIngredientSearch hook:
    for each recipe in RECIPES:
      - hits: user ingredients ∩ recipe ingredients (including substitutions)
      - missing: recipe ingredients - user ingredients - sub coverage
      - matchRate: hits / total recipe ingredients
       │
       ▼
  group: perfect (100%) / near (≥60%) / partial (<60%)
  sort: matchRate DESC → preferenceScore DESC
       │
       ▼
  render: section jump-bar + RecipeCard list
```

### Key Rules

- Substitutions count as hits: if recipe needs "料酒" and user has "啤酒", and "啤酒" is a valid substitute for "料酒" → hit
- All computation is client-side (50 recipes, sub-millisecond)
- Preference score is used as secondary sort key (same match rate → higher preference first)

## UI Architecture

### Entry Point

- **4th top-level tab** "食材搜菜" (after Discover → Browse → Journal)
- Tab order: 发现 → 浏览 → 日志 → 食材搜菜

### Views

#### 1. Search Input

- Text input with autocomplete: as user types, suggest matching ingredient names from all recipes
- Enter/comma to add ingredient as a removable chip
- Click chip × to remove

#### 2. Quick Ingredient Chips

- 12 most common ingredients pre-rendered as tappable chips
- Tap to add to search, tap again to remove
- Sourced from recipe database (frequency count across all recipes)

#### 3. Results Area

- **Section jump bar**: 3 quick-jump buttons at top
  - 全齐 (Perfect) — count badge
  - 接近 (Near) — count badge
  - 勉强 (Partial) — count badge
- Each section header with match rate indicator
- RecipeCard list (reuses existing component) with match badge overlay:
  - Green badge "全齐" → all ingredients matched (including substitutions)
  - Amber badge "缺 N 样" → N ingredients missing
- Tapping a recipe navigates to detail (existing behavior)

#### 4. Quick Actions

- Each result card has a "加入库存" button: one-tap adds all missing ingredients to fridge inventory
- After adding, card updates to show updated match status

## Component Structure

```
New files:
  src/hooks/useIngredientSearch.ts       # Match engine
  src/components/ReverseSearch.tsx       # Main view

Modified files:
  src/App.tsx                            # activeTab type → add 'reverseSearch'
  src/components/RecipeList.tsx          # 4th tab + ReverseSearch render
  src/i18n/translations.ts               # New keys
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `useIngredientSearch` | Accept `ingredients: string[]`, compute matchRate/missing/substitutable for all recipes, return grouped & sorted results |
| `ReverseSearch` | Search input + autocomplete, quick chips, section jump bar, result list with RecipeCards, "add to inventory" button |

### Interfaces

```typescript
interface MatchResult {
  recipe: Recipe
  matchRate: number        // 0-1
  missingCount: number
  substitutableCount: number  // ingredients that can be covered by substitution
  isPerfect: boolean       // matchRate === 1
}

interface SearchResults {
  perfect: MatchResult[]   // 100% match
  near: MatchResult[]      // ≥60% match
  partial: MatchResult[]   // <60% match
}

// useIngredientSearch(ingredients: string[]): SearchResults
```

## Translation Keys Needed

```
tab.reverseSearch          { zh: '食材搜菜', en: 'Search by Ingredient' }
rsearch.placeholder        { zh: '输入食材，用回车或逗号分隔...', en: 'Type ingredients, press Enter to add...' }
rsearch.quickChips         { zh: '常用食材', en: 'Quick Picks' }
rsearch.perfect            { zh: '全齐', en: 'Perfect' }
rsearch.near               { zh: '接近', en: 'Near' }
rsearch.partial            { zh: '勉强', en: 'Partial' }
rsearch.missing            { zh: '缺', en: 'Miss' }
rsearch.subOk              { zh: '可替换', en: 'Sub OK' }
rsearch.addToInventory     { zh: '加入库存', en: 'Add to Fridge' }
rsearch.addedToInventory   { zh: '已加入库存', en: 'Added to Fridge' }
rsearch.empty              { zh: '输入食材开始搜索', en: 'Enter ingredients to start' }
rsearch.noMatch            { zh: '没有菜谱匹配这些食材', en: 'No recipes match these ingredients' }
```

## Integration Points

### With Inventory
- Each result card: "加入库存" button adds all missing ingredients from that recipe to the fridge inventory
- Uses existing `handleToggleInventory` or a batch-add function

### With RecipeCard
- Reuses existing `RecipeCard` component
- New optional prop: `matchBadge?: { type: 'perfect' | 'near' | 'partial', missingCount: number }`

### With Preference Engine
- Secondary sort: same match rate → higher preference score first
- Uses existing `engine.scoreRecipe()` for each result

### With RecipeList
- 4th tab in TABS array
- ReverseSearch renders when `activeTab === 'reverseSearch'`

## Self-Review Checklist

- [x] No TBDs or TODOs
- [x] Data flow clearly specified
- [x] Component boundaries defined
- [x] All translation keys listed
- [x] Integration points mapped
- [x] Match rules unambiguous (substitutions = hit, matchRate = hits/total)
