# Nutrition Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Nutrition Dashboard with custom SVG charts (line, bar, donut) aggregating data from Cooking Journal entries over a custom date range.

**Architecture:** `useNutritionStats` hook aggregates CookEntry[] via recipe lookup into `NutritionStats`. `NutritionCharts` renders custom SVGs (dark theme, cyan/amber/green accent colors matching AlchemistCore). `NutritionDashboard` composes the date range picker, standard view (kcal trend + macros + stat cards), and expandable detail view (cuisine donut + tags + top recipes).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, custom SVG

## Global Constraints

- 6th tab: nutrition after planner
- Custom SVG only — no chart library (matching AlchemistCore dark theme)
- Date range: custom start/end dates
- Standard view: kcal trend line chart, macros bar chart, 3 stat cards
- Detail view: cuisine donut, tag bars, top-5 recipes
- All data from CookEntry[] + RECIPES lookup
- Cyberpunk Bauhaus visual style

---

### Task 1: Add i18n keys + types

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/data/types.ts` (NutritionStats interface)

**Interfaces:**
- Produces: NutritionStats type, 19 nutrition i18n keys

- [ ] **Step 1: Add NutritionStats to types.ts**

```typescript
/** Nutrition Dashboard */

export interface NutritionStats {
  totalKcal: number
  avgKcalPerDay: number
  totalCookCount: number
  avgRating: number
  totalMinutes: number
  macros: { protein: number; fats: number; carbs: number }
  kcalTrend: { date: string; kcal: number }[]
  cuisineDistribution: { name: string; count: number; color: string }[]
  tagDistribution: { tag: string; count: number }[]
  topRecipes: { recipeId: string; count: number }[]
}
```

- [ ] **Step 2: Add 19 i18n keys** (tab.nutrition, nutri.* as listed in spec)

- [ ] **Step 3: Verify + Commit**

```bash
npx tsc --noEmit && git add src/data/types.ts src/i18n/translations.ts && git commit -m "feat: add NutritionStats type and nutrition i18n keys"
```

---

### Task 2: Create useNutritionStats hook

**Files:**
- Create: `src/hooks/useNutritionStats.ts`

**Interfaces:**
- Consumes: CookEntry from types, RECIPES from data, useCookJournal
- Produces: `useNutritionStats(dateStart, dateEnd)` → `NutritionStats`

- [ ] **Step 1: Write aggregation engine**

Filter entries by date range, lookup macros/kcal per recipeId, compute trends (group by day), distributions (cuisine/tag/top recipes), and aggregated stats. Return full `NutritionStats`.

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/hooks/useNutritionStats.ts && git commit -m "feat: add useNutritionStats aggregation hook"
```

---

### Task 3: Create NutritionCharts SVG component

**Files:**
- Create: `src/components/NutritionCharts.tsx`

**Interfaces:**
- Consumes: NutritionStats data points
- Produces: KcalLineChart, MacrosBarChart, CuisineDonut — custom SVG components

- [ ] **Step 1: Write SVG charts**

Three chart components in one file:
- **KcalLineChart**: SVG line chart, 300x150 viewBox, dark grid lines, cyan stroke, circular data points
- **MacrosBarChart**: 3 horizontal bars (protein green #10B981, fats amber #FF9F0A, carbs cyan #00E5FF), label + value
- **CuisineDonut**: SVG donut chart with colored segments, center text showing total, legend below

All using `strokeWidth`, `fill`, `opacity` matching the Cyberpunk Bauhaus dark theme.

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/components/NutritionCharts.tsx && git commit -m "feat: add custom SVG nutrition charts"
```

---

### Task 4: Create NutritionDashboard component

**Files:**
- Create: `src/components/NutritionDashboard.tsx`

**Interfaces:**
- Consumes: useNutritionStats, NutritionCharts, useLang, useCookJournal
- Produces: Full dashboard view

- [ ] **Step 1: Write dashboard**

- Date range picker (two date inputs: from / to, default to this month)
- Standard view: hero kcal stat + kcal line chart + macros bar chart + 3 stat cards (cooks, rating, hours)
- Expandable detail section: cuisine donut + tag horizontal bars + top-5 recipes
- Empty state when no data in range
- Cyberpunk Bauhaus dark theme styling

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/components/NutritionDashboard.tsx && git commit -m "feat: add NutritionDashboard component"
```

---

### Task 5: Wire into App.tsx + RecipeList.tsx

**Files:**
- Modify: `src/components/RecipeList.tsx` (6th tab)
- Modify: `src/App.tsx` (tab type)

- [ ] **Step 1: Add 6th tab**

Import NutritionDashboard, extend TABS with `{ key: 'nutrition', icon: BarChart3 }` from lucide-react. Update types. Render `<NutritionDashboard />` in scroll area.

Extend App.tsx activeTab type with `'nutrition'`.

- [ ] **Step 2: Verify build + Commit**

```bash
npm run build && git add src/components/RecipeList.tsx src/App.tsx && git commit -m "feat: wire NutritionDashboard as 6th tab"
```
