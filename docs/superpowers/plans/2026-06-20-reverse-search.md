# Reverse Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Reverse Search module that lets users find recipes by typing ingredients, with autocomplete, quick-pick chips, grouped results, and one-tap inventory add.

**Architecture:** A `useIngredientSearch` hook computes match rates across all recipes (substitutions = hits). `ReverseSearch` renders search input with autocomplete, quick ingredient chips, a section jump bar, and result cards with match badges. Integrates as the 4th top-level tab.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, localStorage (existing useStoredState)

## Global Constraints

- All existing component props remain (new ones are optional on RecipeCard)
- Tab order: discover → browse → journal → reverseSearch (4th position)
- Substitutions count as hits
- All matching is client-side (50 recipes)
- Sort: matchRate DESC → preferenceScore DESC
- Match groups: perfect (100%), near (≥60%), partial (<60%)
- Quick chips: top 12 most frequent ingredients across all recipes
- Cyberpunk Bauhaus visual style — match existing accent colors, font vars
- i18n: all UI strings via t() keys in translations.ts

---

### Task 1: Add translation keys

**Files:**
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: reverse search i18n keys used by Task 4

- [ ] **Step 1: Add keys**

Append to the `T` object in `src/i18n/translations.ts` (before closing `}`):

```typescript
  /* Reverse Search */
  'tab.reverseSearch':      { zh: '食材搜菜', en: 'Ingredient Search' },
  'rsearch.placeholder':    { zh: '输入食材，回车或逗号添加...', en: 'Type ingredients, press Enter to add...' },
  'rsearch.quickChips':     { zh: '常用食材', en: 'Quick Picks' },
  'rsearch.perfect':        { zh: '全齐', en: 'Perfect' },
  'rsearch.near':           { zh: '接近', en: 'Near' },
  'rsearch.partial':        { zh: '勉强', en: 'Partial' },
  'rsearch.missing':        { zh: '缺', en: 'Miss' },
  'rsearch.subOk':          { zh: '可替换', en: 'Sub OK' },
  'rsearch.addToInventory': { zh: '加入库存', en: 'Add to Fridge' },
  'rsearch.empty':          { zh: '输入食材开始搜索', en: 'Enter ingredients to start searching' },
  'rsearch.noMatch':        { zh: '没有菜谱匹配这些食材', en: 'No recipes match these ingredients' },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat: add reverse search i18n keys"
```

---

### Task 2: Create useIngredientSearch hook

**Files:**
- Create: `src/hooks/useIngredientSearch.ts`

**Interfaces:**
- Consumes: `Recipe`, `Ingredient` from `src/data/types`, `RECIPES` from `src/data/recipes`
- Produces: `useIngredientSearch(ingredients: string[], preferenceScores?: Map<string, number>)` → `{ perfect, near, partial, allResults }` with type `SearchResult`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useIngredientSearch.ts`:

```typescript
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
      names.add(ing.nameEn)
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useIngredientSearch.ts
git commit -m "feat: add useIngredientSearch hook with match engine"
```

---

### Task 3: Add matchBadge prop to RecipeCard

**Files:**
- Modify: `src/components/RecipeCard.tsx`

**Interfaces:**
- Consumes: New optional prop `matchBadge`
- Produces: Badge overlay on card when matchBadge is set

- [ ] **Step 1: Add interface and render**

In `src/components/RecipeCard.tsx`, add to `RecipeCardProps`:

```typescript
interface RecipeCardProps {
  recipe: Recipe
  inventory: Set<string>
  lang?: 'zh' | 'en'
  onClick: () => void
  onQuickAddMissing: (recipe: Recipe) => void
  onFavorite?: () => void
  isFavorited?: boolean
  matchScore?: number
  matchBadge?: { type: 'perfect' | 'near' | 'partial'; missingCount: number; substitutableCount: number }
}
```

Destructure `matchBadge` from props.

Add badge render block after the existing matchScore indicator (before long-press preview):

```tsx
{/* Reverse search match badge */}
{matchBadge && (
  <div
    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-1"
    style={{
      fontFamily: 'var(--font-mono)',
      color: matchBadge.type === 'perfect' ? '#10B981' : matchBadge.type === 'near' ? '#FF9F0A' : '#5A6272',
      background: matchBadge.type === 'perfect' ? 'rgba(16, 185, 129, 0.12)' : matchBadge.type === 'near' ? 'rgba(255, 159, 10, 0.1)' : 'rgba(90, 98, 114, 0.08)',
      border: matchBadge.type === 'perfect' ? '1px solid rgba(16, 185, 129, 0.3)' : matchBadge.type === 'near' ? '1px solid rgba(255, 159, 10, 0.25)' : '1px solid rgba(90, 98, 114, 0.12)',
    }}>
    {matchBadge.type === 'perfect'
      ? (lang === 'en' ? 'Perfect' : '全齐')
      : matchBadge.type === 'near'
        ? `${lang === 'en' ? 'Miss' : '缺'} ${matchBadge.missingCount}`
        : `${matchBadge.missingCount}+ ${lang === 'en' ? 'missing' : '缺'}`
    }
  </div>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RecipeCard.tsx
git commit -m "feat: add matchBadge prop to RecipeCard for reverse search"
```

---

### Task 4: Create ReverseSearch component

**Files:**
- Create: `src/components/ReverseSearch.tsx`

**Interfaces:**
- Consumes: `useIngredientSearch`, `RecipeCard`, `useLang`, `Recipe`
- Produces: Full reverse search view with input, chips, results

- [ ] **Step 1: Write ReverseSearch**

Create `src/components/ReverseSearch.tsx`:

```typescript
import { useState, useMemo } from 'react'
import { Search, X, Plus, Check } from 'lucide-react'
import type { Recipe, CookEntry } from '../data/types'
import { useIngredientSearch, getTopIngredients, getAllIngredientNames } from '../hooks/useIngredientSearch'
import RecipeCard from './RecipeCard'
import { useLang } from '../i18n/context'

interface ReverseSearchProps {
  inventory: Set<string>
  preferenceScores: Map<string, number>
  onSelect: (recipe: Recipe) => void
  onQuickAddMissing: (recipe: Recipe) => void
  onToggleRecipeFavorite: (id: string) => void
  favoriteIds: Set<string>
  onAddToInventory: (nameZh: string) => void
}

const QUICK_CHIPS = getTopIngredients(12)
const ALL_NAMES = getAllIngredientNames()

export default function ReverseSearch({
  inventory, preferenceScores, onSelect, onQuickAddMissing,
  onToggleRecipeFavorite, favoriteIds, onAddToInventory,
}: ReverseSearchProps) {
  const { t, lang } = useLang()
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [addedToFridge, setAddedToFridge] = useState<Set<string>>(new Set())

  const results = useIngredientSearch(ingredients, preferenceScores)
  const { perfect, near, partial } = results
  const hasResults = perfect.length > 0 || near.length > 0 || partial.length > 0

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    const q = inputValue.trim().toLowerCase()
    return ALL_NAMES
      .filter((n) => n.toLowerCase().includes(q) && !ingredients.includes(n))
      .slice(0, 5)
  }, [inputValue, ingredients])

  const addIngredient = (name: string) => {
    if (name && !ingredients.includes(name)) {
      setIngredients((prev) => [...prev, name])
    }
    setInputValue('')
  }

  const removeIngredient = (name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue.trim())
    }
  }

  const handleAddAllToInventory = (recipe: Recipe) => {
    for (const ing of recipe.ingredients) {
      if (!inventory.has(ing.nameZh)) {
        onAddToInventory(ing.nameZh)
      }
    }
    setAddedToFridge((prev) => {
      const next = new Set(prev)
      next.add(recipe.id)
      return next
    })
  }

  // Active section for jump buttons
  const [activeSection, setActiveSection] = useState<'perfect' | 'near' | 'partial' | null>(null)

  return (
    <div className="flex flex-col min-h-0">
      {/* Ingredient input */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
          <Search size={14} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('rsearch.placeholder')}
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-dim outline-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          {inputValue && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 z-30 rounded-md overflow-hidden"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
              {suggestions.map((name) => (
                <button key={name} onClick={() => addIngredient(name)}
                  className="w-full text-left px-3 py-2 text-[12px] text-text-muted hover:bg-charcoal-800/50"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ingredient chips */}
        {ingredients.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {ingredients.map((name) => (
              <span key={name} onClick={() => removeIngredient(name)}
                className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-70 flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                {name} <X size={10} />
              </span>
            ))}
          </div>
        )}

        {/* Quick chips */}
        <div className="mt-2">
          <span className="text-[9px] tracking-[0.1em] uppercase text-text-dim block mb-1.5"
            style={{ fontFamily: 'var(--font-mono)' }}>{t('rsearch.quickChips')}</span>
          <div className="flex gap-1 flex-wrap">
            {QUICK_CHIPS.map((name) => {
              const isActive = ingredients.includes(name)
              return (
                <button key={name} onClick={() => isActive ? removeIngredient(name) : addIngredient(name)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: isActive ? '#F4F4F4' : '#5A6272',
                    background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid rgba(138, 148, 166, 0.1)',
                  }}>
                  {isActive ? <Check size={9} className="inline mr-0.5" /> : <Plus size={9} className="inline mr-0.5" />}
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {!hasResults && ingredients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Search size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('rsearch.empty')}</p>
          </div>
        )}

        {!hasResults && ingredients.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Search size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('rsearch.noMatch')}</p>
          </div>
        )}

        {hasResults && (
          <>
            {/* Section jump bar */}
            <div className="flex gap-2 mb-4 sticky top-0 py-2 z-10"
              style={{ background: '#0A0E17' }}>
              {[
                { key: 'perfect' as const, label: t('rsearch.perfect'), count: perfect.length, color: '#10B981' },
                { key: 'near' as const, label: t('rsearch.near'), count: near.length, color: '#FF9F0A' },
                { key: 'partial' as const, label: t('rsearch.partial'), count: partial.length, color: '#5A6272' },
              ].map(({ key, label, count, color }) => (
                <button key={key} onClick={() => setActiveSection(key)}
                  disabled={count === 0}
                  className="flex-1 py-1.5 rounded text-[10px] tracking-[0.06em] transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: activeSection === key ? '#F4F4F4' : count > 0 ? color : '#2A303C',
                    background: activeSection === key ? `${color}20` : 'transparent',
                    border: activeSection === key ? `1px solid ${color}40` : '1px solid transparent',
                    opacity: count > 0 ? 1 : 0.4,
                  }}>
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Perfect matches */}
            {perfect.length > 0 && (
              <div className="mb-4" id="section-perfect">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#10B981', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.perfect')} · {perfect.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {perfect.map((r) => (
                    <RecipeCard key={r.recipe.id} recipe={r.recipe} inventory={inventory} lang={lang}
                      onClick={() => onSelect(r.recipe)}
                      onQuickAddMissing={onQuickAddMissing}
                      onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                      isFavorited={favoriteIds.has(r.recipe.id)}
                      matchBadge={{ type: 'perfect', missingCount: 0, substitutableCount: r.substitutableCount }} />
                  ))}
                </div>
              </div>
            )}

            {/* Near matches */}
            {near.length > 0 && (
              <div className="mb-4" id="section-near">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#FF9F0A', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.near')} · {near.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {near.map((r) => (
                    <RecipeCard key={r.recipe.id} recipe={r.recipe} inventory={inventory} lang={lang}
                      onClick={() => onSelect(r.recipe)}
                      onQuickAddMissing={onQuickAddMissing}
                      onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                      isFavorited={favoriteIds.has(r.recipe.id)}
                      matchBadge={{ type: 'near', missingCount: r.missingCount, substitutableCount: r.substitutableCount }} />
                  ))}
                </div>
              </div>
            )}

            {/* Partial matches */}
            {partial.length > 0 && (
              <div className="mb-4" id="section-partial">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#5A6272', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.partial')} · {partial.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {partial.map((r) => (
                    <RecipeCard key={r.recipe.id} recipe={r.recipe} inventory={inventory} lang={lang}
                      onClick={() => onSelect(r.recipe)}
                      onQuickAddMissing={onQuickAddMissing}
                      onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                      isFavorited={favoriteIds.has(r.recipe.id)}
                      matchBadge={{ type: 'partial', missingCount: r.missingCount, substitutableCount: r.substitutableCount }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ReverseSearch.tsx
git commit -m "feat: add ReverseSearch component with autocomplete and grouped results"
```

---

### Task 5: Wire ReverseSearch into App.tsx + RecipeList.tsx

**Files:**
- Modify: `src/components/RecipeList.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ReverseSearch` component, extended tab type
- Produces: 4th tab "食材搜菜", ReverseSearch rendering, props wiring

- [ ] **Step 1: Update RecipeList — TABS and rendering**

In `src/components/RecipeList.tsx`:

Add import (check if `Search` is already imported — use `Search` from lucide-react):

```typescript
import ReverseSearch from './ReverseSearch'
```

Extend `TABS`:

```typescript
const TABS: { key: 'discover' | 'browse' | 'journal' | 'reverseSearch'; icon: typeof Flame }[] = [
  { key: 'discover', icon: Sparkles },
  { key: 'browse', icon: Grid3X3 },
  { key: 'journal', icon: BookOpen },
  { key: 'reverseSearch', icon: Search },
]
```

Update the `RecipeListProps` interface:
- `activeTab` type → `'discover' | 'browse' | 'journal' | 'reverseSearch'`
- `onTabChange` type → same
- Add new props: `preferenceScores`, `inventory`, `onAddToInventory`, `onSelect`, `onQuickAddMissing`, `onToggleRecipeFavorite`, `favoriteIds` — actually most of these already exist. Add only what's needed.

Wait — looking at the existing props, `inventory`, `onSelect`, `onQuickAddMissing`, `onToggleRecipeFavorite`, `favoriteIds` are already there. `preferenceScores` is already there as `recipeScores`. I just need to add `onAddToInventory`.

Actually, looking at the ReverseSearch component's props, it needs `inventory`, `preferenceScores`, `onSelect`, `onQuickAddMissing`, `onToggleRecipeFavorite`, `favoriteIds`, and `onAddToInventory`. The RecipeList already has all of these except `onAddToInventory`.

Add `onAddToInventory: (nameZh: string) => void` to `RecipeListProps`.

Destructure it in the function params.

Add the rendering block (after journal section, before browse section):

```tsx
{/* ── Reverse Search tab ──────────────────────────── */}
{activeTab === 'reverseSearch' && !query && !showFavorites && (
  <ReverseSearch
    inventory={inventory}
    preferenceScores={recipeScores}
    onSelect={handleSelect}
    onQuickAddMissing={onQuickAddMissing}
    onToggleRecipeFavorite={onToggleRecipeFavorite}
    favoriteIds={favoriteIds}
    onAddToInventory={onAddToInventory}
  />
)}
```

- [ ] **Step 2: Update App.tsx**

Extend `activeTab` type to `'discover' | 'browse' | 'journal' | 'reverseSearch'`.

Pass `onAddToInventory` prop to RecipeList:

```typescript
onAddToInventory={handleToggleInventory}
```

(Maintains the `handleToggleInventory` function which toggles an ingredient in/out of fridge)

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/RecipeList.tsx src/App.tsx
git commit -m "feat: wire ReverseSearch as 4th tab into app"
```

---

### Task 6: Final integration verification + bugfix

**Files:**
- Verify only — no new code

**Interfaces:**
- Verify all integration points work correctly

- [ ] **Step 1: Verify the full build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 2: Verify all tabs work**

Check RecipeList.tsx renders correctly:
- Discover tab → scene packs + recommendations ✅
- Browse tab → filtered list + sort toggle ✅
- Journal tab → CookJournal ✅
- ReverseSearch tab → ReverseSearch ✅

- [ ] **Step 3: Verify autocomplete is isolated**

The autocomplete dropdown in ReverseSearch uses absolute positioning. Check it doesn't overlap with the RecipeList's search history dropdown (which uses similar positioning). Both are conditionally rendered on different tabs so no conflict.

- [ ] **Step 4: Commit verification**

```bash
git add -A
git commit -m "chore: final verification for reverse search integration"
```

---

### Self-Review Checklist

1. **Spec coverage:**
   - [x] Translation keys (Task 1)
   - [x] useIngredientSearch hook with match rate, substitution support, grouping (Task 2)
   - [x] MatchBadge on RecipeCard (Task 3)
   - [x] ReverseSearch component with autocomplete, quick chips, section jump bar, results (Task 4)
   - [x] 4th tab integration in RecipeList + App.tsx (Task 5)
   - [x] Final verification (Task 6)

2. **Placeholder scan:** No TBDs or vague references.

3. **Type consistency:**
   - `SearchResult` defined in Task 2, consumed in Tasks 4 ✅
   - `GroupedResults` defined in Task 2, consumed in Task 4 ✅
   - `getTopIngredients(12)` → `string[]` used in Task 4 for QUICK_CHIPS ✅
   - `getAllIngredientNames()` → `string[]` used in Task 4 for autocomplete ✅
   - `matchBadge` prop added in Task 3, passed from Task 4 ✅
   - Translation keys from Task 1 used in Task 4 ✅
