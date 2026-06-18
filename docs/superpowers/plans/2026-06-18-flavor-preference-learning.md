# Flavor Preference Learning System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a behavior-driven preference learning engine that scores and sorts recipes based on user interactions, with semi-transparent preference tags, exploration injection, and time decay.

**Architecture:** A standalone `usePreferenceEngine` hook manages a `PreferenceProfile` (EMA flavor vector + weighted counters) persisted via `useStoredState`. App.tsx owns the engine, records interactions in existing handlers, and passes derived scores/tags to children as props. RecipeList consumes scores for global sorting; PreferenceBar renders auto-generated tags.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, localStorage (existing `useStoredState` pattern)

## Global Constraints

- All existing component props remain (new ones are optional)
- Manual preference picker fully preserved as override
- `totalInteractions < 3` → system silent, experience unchanged
- A-Z sort toggle always available
- Reset clears everything to `INITIAL_PROFILE`
- Profile is never modified during reads — only writes mutate stored state
- localStorage key: `cooking-lab:preferenceProfile`

---

### Task 1: Add type definitions

**Files:**
- Modify: `src/data/types.ts`

**Interfaces:**
- Produces: `FlavorPreference`, `ActionType`, `PreferenceProfile` — used by all subsequent tasks

- [ ] **Step 1: Add new types to types.ts**

Append to `src/data/types.ts` after the existing `Recipe` interface:

```typescript
/** Flavor preference vector — mirrors FlavorProfile structure */
export interface FlavorPreference {
  acid: number
  sweet: number
  bitter: number
  spicy: number
  salty: number
  umami: number
}

/** Category weighted counts */
export type CategoryPreference = Record<Category, number>

/** User action types for preference learning */
export type ActionType = 'view' | 'favorite' | 'unfavorite' | 'cook' | 'cart'

/** Learned user preference profile */
export interface PreferenceProfile {
  flavor: FlavorPreference
  categories: CategoryPreference
  timePreference: [number, number, number]   // [fast, medium, long]
  difficultyPreference: [number, number, number] // [easy, medium, hard]
  totalInteractions: number
  lastUpdated: number
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no new errors (only pre-existing warnings if any).

- [ ] **Step 3: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: add PreferenceProfile, ActionType, FlavorPreference types"
```

---

### Task 2: Create usePreferenceEngine hook

**Files:**
- Create: `src/hooks/usePreferenceEngine.ts`
- Modify: `src/hooks/useStoredState.ts` (no changes needed — reuse existing)

**Interfaces:**
- Consumes: `PreferenceProfile`, `ActionType`, `FlavorPreference`, `Category` from `src/data/types`
- Produces: `usePreferenceEngine()` → `{ profile, record, scoreRecipe, scoreAll, generateTags, reset }`

- [ ] **Step 1: Write the engine hook**

Create `src/hooks/usePreferenceEngine.ts`:

```typescript
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
```

- [ ] **Step 2: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to usePreferenceEngine.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePreferenceEngine.ts
git commit -m "feat: add usePreferenceEngine hook with EMA flavor learning"
```

---

### Task 3: Wire engine into App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `usePreferenceEngine` from `src/hooks/usePreferenceEngine`
- Produces: `recipeScores` (Map<string,number>) passed to RecipeList; `tags` (string[]) + `onReset` passed to PreferenceBar; `record()` calls in handlers

- [ ] **Step 1: Add engine import and invocation**

In `src/App.tsx`, add import:

```typescript
import { usePreferenceEngine } from './hooks/usePreferenceEngine'
```

Inside the `App` function, after existing hooks (after `const { lang, t } = useLang()`), add:

```typescript
const engine = usePreferenceEngine()
```

- [ ] **Step 2: Memoize derived data**

After the engine line, add:

```typescript
const recipeScores = useMemo(
  () => engine.scoreAll(RECIPES),
  [engine.scoreAll],
)

const preferenceTags = useMemo(
  () => engine.generateTags(lang),
  [engine.generateTags, lang],
)
```

Import `RECIPES` at top (if not already imported in App.tsx — it currently isn't, so add):

```typescript
import { RECIPES } from './data/recipes'
```

- [ ] **Step 3: Add record() calls to interaction handlers**

In `handleSelectRecipe`, after `setActiveSubstitutions(...)` block (line 111-115), add:

```typescript
engine.record(recipe, 'view')
```

In `handleToggleFavorite`, before the toast call (line 125), add:

```typescript
engine.record(selectedRecipe, wasFavorited ? 'unfavorite' : 'favorite')
```

In `handleAddToCart`, before the toast (line 140), add:

```typescript
engine.record(id, 'cart')
```

Note: `handleAddToCart` receives an ingredient `id` (string), not a Recipe. We need the current `selectedRecipe` for context. Change the record call to:

```typescript
if (selectedRecipe) engine.record(selectedRecipe, 'cart')
```

- [ ] **Step 4: Add FocusMode onComplete handler**

After `handleClearCart`, add:

```typescript
const handleFocusComplete = useCallback((completionRatio: number) => {
  if (completionRatio > 0.5 && selectedRecipe) {
    engine.record(selectedRecipe, 'cook')
  }
}, [engine, selectedRecipe])
```

In the FocusMode JSX (line 317-318), change:

```tsx
<FocusMode key={`focus-${selectedRecipe.id}`} steps={selectedRecipe.steps} onExit={() => setFocusMode(false)} />
```

to:

```tsx
<FocusMode key={`focus-${selectedRecipe.id}`} steps={selectedRecipe.steps} onExit={() => setFocusMode(false)} onComplete={handleFocusComplete} />
```

- [ ] **Step 5: Pass recipeScores to RecipeList**

Find the `<RecipeList` JSX block (~line 182). Add `recipeScores` prop:

```tsx
recipeScores={recipeScores}
```

- [ ] **Step 6: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no TS errors. (RecipeList will error until Task 5 updates its props — that's expected.)

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire usePreferenceEngine into App, record interactions"
```

---

### Task 4: Create PreferenceBar component

**Files:**
- Create: `src/components/PreferenceBar.tsx`

**Interfaces:**
- Consumes: `tags: string[]`, `onReset: () => void`
- Produces: Rendered preference tag bar (hidden when tags empty = cold start)

- [ ] **Step 1: Write PreferenceBar component**

Create `src/components/PreferenceBar.tsx`:

```typescript
import { X } from 'lucide-react'
import { useLang } from '../i18n/context'

interface PreferenceBarProps {
  tags: string[]
  onReset: () => void
}

export default function PreferenceBar({ tags, onReset }: PreferenceBarProps) {
  const { t } = useLang()

  if (tags.length === 0) return null // hidden during cold start or when no tags

  return (
    <div className="px-4 pb-3">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md flex-wrap"
        style={{
          background: 'linear-gradient(105deg, rgba(0, 229, 255, 0.04), rgba(255, 46, 147, 0.03))',
          border: '1px solid rgba(0, 229, 255, 0.08)',
        }}
      >
        {/* Icon */}
        <span className="text-[13px] flex-shrink-0">🧬</span>

        {/* Label */}
        <span
          className="text-[10px] tracking-[0.08em] uppercase text-text-dim flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {t('pref.yourTaste')}
        </span>

        {/* Tags */}
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[10px]"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#F4F4F4',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
            }}
          >
            {tag}
          </span>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Reset button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(t('pref.resetConfirm'))) onReset()
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] tracking-[0.06em] transition-colors duration-200 hover:text-[#FF2E93]"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#5A6272',
          }}
        >
          <X size={10} strokeWidth={1.5} />
          {t('pref.reset')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add translations**

Add to `src/i18n/translations.ts`:

In the `zh` object, add:

```typescript
pref: {
  // ... existing keys ...
  yourTaste: '你的口味',
  reset: '重置',
  resetConfirm: '确定要重置口味学习数据吗？这将清除所有偏好。',
  autoHint: '已根据你的口味自动排序。手动设置将覆盖自动偏好。',
  sortPreference: '按口味推荐',
  sortAlpha: '按名称 A-Z',
  explore: '尝鲜',
},
```

In the `en` object, add:

```typescript
pref: {
  // ... existing keys ...
  yourTaste: 'Your Taste',
  reset: 'Reset',
  resetConfirm: 'Reset taste learning data? This clears all preferences.',
  autoHint: 'Sorted by your taste. Manual filters will override.',
  sortPreference: 'By Taste',
  sortAlpha: 'A-Z',
  explore: 'Explore',
},
```

- [ ] **Step 3: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/PreferenceBar.tsx src/i18n/translations.ts
git commit -m "feat: add PreferenceBar component with i18n tags"
```

---

### Task 5: Update RecipeList — sorting and Discover section

**Files:**
- Modify: `src/components/RecipeList.tsx`

**Interfaces:**
- Consumes: `recipeScores: Map<string, number>` prop, `PreferenceBar` component
- Produces: Sorted lists by preference, simplified Discover 推荐 section with exploration, sort toggle

- [ ] **Step 1: Add new props and imports**

In `RecipeListProps` interface, add:

```typescript
recipeScores: Map<string, number>
```

Add imports at top:

```typescript
import PreferenceBar from './PreferenceBar'
```

- [ ] **Step 2: Add sortMode state and sort toggle**

After existing state declarations (after `const [showFab, setShowFab] = useState(false)`), add:

```typescript
const [sortMode, setSortMode] = useState<'preference' | 'alphabetical'>('preference')
const { lang, toggleLang, t } = useLang()
```

Note: `lang`, `toggleLang`, `t` already exist in the component — just ensure `t` is destructured if not already.

- [ ] **Step 3: Update filtered useMemo to sort by preference**

Replace the `filtered` useMemo's sort line (currently `list = [...list].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))`):

```typescript
// Sort: preference by default, alphabetical on toggle
if (sortMode === 'alphabetical') {
  list = [...list].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
} else if (recipeScores.size > 0) {
  list = [...list].sort((a, b) => (recipeScores.get(b.id) ?? 0.5) - (recipeScores.get(a.id) ?? 0.5))
} else {
  list = [...list].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
}
```

Update the dependency array to include `sortMode, recipeScores`.

- [ ] **Step 4: Replace Discover "推荐" section**

Remove the `flavorSimilar` and `suggestedRecipes` useMemos entirely.

Replace the existing merged 推荐 section (lines 605-641 in original) with:

```typescript
{/* Merged: 为你推荐 (scored by preference engine + exploration) */}
{(recentRecipes.length > 0 || recipeScores.size > 0) && (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <Sparkles size={11} strokeWidth={1.5} className="text-amber-500" />
      <span className="text-[10px] tracking-[0.15em] uppercase text-text-dim"
        style={{ fontFamily: 'var(--font-mono)' }}>{t('home.suggested')}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255, 159, 10, 0.06)' }} />
    </div>
    <div className="flex gap-2 flex-wrap">
      {(() => {
        const seen = new Set(recentIds)
        // All recipes sorted by score, excluding viewed
        const scored = RECIPES
          .filter((r) => !seen.has(r.id))
          .map((r) => ({ recipe: r, score: recipeScores.get(r.id) ?? 0.5 }))
          .sort((a, b) => b.score - a.score)

        // High-score pool and exploration pool
        const highScore = scored.filter((s) => s.score >= 0.5)
        const explore = scored.filter((s) => s.score < 0.5)

        // Shuffle exploration pool
        for (let i = explore.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [explore[i], explore[j]] = [explore[j], explore[i]]
        }

        // Build: 3 high-score + 2 exploration
        const items: { recipe: typeof RECIPES[0]; label: string }[] = []
        highScore.slice(0, 3).forEach((s) => items.push({ recipe: s.recipe, label: '' }))
        explore.slice(0, 2).forEach((s) => items.push({
          recipe: s.recipe,
          label: lang === 'en' ? '🌱 Explore' : '🌱 尝鲜',
        }))

        // Fill remaining with high-score if exploration pool insufficient
        if (items.length < 5) {
          const used = new Set(items.map((i) => i.recipe.id))
          for (const s of scored) {
            if (items.length >= 5) break
            if (!used.has(s.recipe.id)) {
              items.push({ recipe: s.recipe, label: '' })
            }
          }
        }

        return items.slice(0, 5).map(({ recipe, label }) => (
          <button key={recipe.id} onClick={() => handleSelect(recipe)}
            className="text-left px-3 py-2 rounded-md transition-all duration-200 hover:bg-charcoal-800/50"
            style={{ background: '#121620', border: `1px solid ${label ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 229, 255, 0.04)'}` }}>
            <span className="text-[12px] text-text-primary block"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{recipe.emoji} {lang === 'en' ? recipe.nameEn : recipe.nameZh}</span>
            {label && (
              <span className="text-[9px]" style={{ fontFamily: 'var(--font-body)', color: '#10B981' }}>{label}</span>
            )}
          </button>
        ))
      })()}
    </div>
  </div>
)}
```

- [ ] **Step 5: Add PreferenceBar and sort toggle to Discover view**

In the Discover rendering block, before scene sections, add PreferenceBar:

```tsx
{activeTab === 'discover' && !query && !showFavorites && (
  <>
    <PreferenceBar tags={preferenceTags} onReset={handleResetPreferences} />
    {/* Scene packs (existing code follows) */}
```

Add `handleResetPreferences` handler (or receive `onResetPreferences` from parent via App.tsx — see Step 7). For now, add a local proxy. Actually, RecipeList doesn't own the engine — the reset needs to flow to App.tsx. We need a prop.

Add to `RecipeListProps`:
```typescript
onResetPreferences: () => void
```

And destructure it.

In App.tsx (check back there), pass `engine.reset` as `onResetPreferences`.

Then in RecipeList, replace the `PreferenceBar` tag usage with the `onResetPreferences` prop destructured from props (alongside `preferenceTags` — which must also come from App.tsx).

Wait — currently RecipeList receives `preferenceTags`? No. The PreferenceBar is rendered inside RecipeList's Discover block. So RecipeList needs both `preferenceTags` and `onResetPreferences` as new props from App.tsx.

Actually, let me keep it simpler: PreferenceBar is small enough to be rendered directly in App.tsx, above RecipeList, only when `!selectedRecipe`. But that clutters App.tsx. Better to pass props through RecipeList since RecipeList owns the Discover tab layout.

So: add to `RecipeListProps`:
```typescript
preferenceTags: string[]
onResetPreferences: () => void
```

Update RecipeList's `<PreferenceBar>` call:
```tsx
<PreferenceBar tags={preferenceTags} onReset={onResetPreferences} />
```

- [ ] **Step 6: Add sort toggle to Browse/search/favorites list header**

In the browse/filtered section (around line 649), add sort toggle button before the results count:

```tsx
<div className="flex items-center gap-2 mb-3">
  <span className="text-[10px] tracking-[0.15em] uppercase text-text-dim"
    style={{ fontFamily: 'var(--font-mono)' }}>
    {showFavorites ? '❤️ 我的收藏' : query ? '搜索结果' : activeTab === 'browse' && browseSub !== 'all' ? t(`tab.${browseSub}`) : t('home.browseAll')}
  </span>
  <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>({filtered.length})</span>
  <div className="flex-1" />
  <button onClick={() => setSortMode((m) => m === 'preference' ? 'alphabetical' : 'preference')}
    className="text-[9px] tracking-[0.06em] px-2 py-0.5 rounded transition-colors duration-200"
    style={{
      fontFamily: 'var(--font-mono)',
      color: sortMode === 'preference' ? '#00E5FF' : '#5A6272',
      background: sortMode === 'preference' ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
      border: sortMode === 'preference' ? '1px solid rgba(0, 229, 255, 0.15)' : '1px solid transparent',
    }}>
    ▸ {sortMode === 'preference' ? t('pref.sortPreference') : t('pref.sortAlpha')}
  </button>
</div>
```

- [ ] **Step 7: Add auto-sort hint when manual picker is inactive**

After the manual preference picker collapse button, add a hint line. Find the `</button>` closing the picker toggle (line 303 in original, after `ChevronDown`). After the closing `</button>` and before the `{showPrefs && (` block, add:

```tsx
{!showPrefs && !hasPrefs && recipeScores.size > 0 && (
  <p className="mt-1.5 text-[10px] text-text-dim"
    style={{ fontFamily: 'var(--font-body)', opacity: 0.6 }}>
    💡 {t('pref.autoHint')}
  </p>
)}
```

- [ ] **Step 8: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/RecipeList.tsx
git commit -m "feat: integrate preference sorting, exploration injection, and PreferenceBar"
```

---

### Task 6: Update RecipeCard — matchScore indicator

**Files:**
- Modify: `src/components/RecipeCard.tsx`

**Interfaces:**
- Consumes: `matchScore?: number` prop

- [ ] **Step 1: Add matchScore prop**

In `RecipeCardProps` interface, add:

```typescript
matchScore?: number
```

Destructure from props:

```typescript
export default function RecipeCard({ recipe, inventory, lang, onClick, onQuickAddMissing, onFavorite, isFavorited, matchScore }: RecipeCardProps) {
```

- [ ] **Step 2: Add match dot to the card**

In the JSX, inside the `<button>` element, add a small dot overlay in the top-right corner. Place it just before the closing `</button>` (after the long-press preview popup block):

```tsx
{/* Match score indicator */}
{matchScore !== undefined && matchScore > 0.5 && (
  <div
    className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
    style={{
      background: matchScore > 0.8 ? '#10B981' : 'rgba(0, 229, 255, 0.2)',
      boxShadow: matchScore > 0.8 ? '0 0 4px rgba(16, 185, 129, 0.4)' : 'none',
    }}
  />
)}
```

- [ ] **Step 3: Pass matchScore in RecipeList**

In RecipeList's render of RecipeCard (filtered list section, around line 674), add:

```tsx
matchScore={recipeScores.get(recipe.id)}
```

- [ ] **Step 4: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/components/RecipeCard.tsx src/components/RecipeList.tsx
git commit -m "feat: add matchScore indicator dot to RecipeCard"
```

---

### Task 7: Update FocusMode — onComplete callback

**Files:**
- Modify: `src/components/FocusMode.tsx`

**Interfaces:**
- Consumes: new optional `onComplete?: (completionRatio: number) => void` prop

- [ ] **Step 1: Add onComplete prop**

In `FocusModeProps` interface, add:

```typescript
onComplete?: (completionRatio: number) => void
```

Destructure from props:

```typescript
export default function FocusMode({ steps, onExit, onComplete }: FocusModeProps) {
```

- [ ] **Step 2: Call onComplete at each exit point**

There are three exit points. Add `onComplete?.()` before `onExit` at each one.

Exit point 1 (manual exit with timer, around line 132):

```typescript
setVisible(false)
onComplete?.((activeStep + 1) / steps.length)
setTimeout(onExit, 400)
```

Exit point 2 (manual exit no timer, around line 140):

```typescript
setVisible(false)
onComplete?.((activeStep + 1) / steps.length)
setTimeout(onExit, 400)
```

Exit point 3 (keyboard exit, around line 187):

```typescript
setVisible(false)
onComplete?.((activeStep + 1) / steps.length)
setTimeout(onExit, 400)
```

- [ ] **Step 3: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FocusMode.tsx
git commit -m "feat: add onComplete callback to FocusMode for cook tracking"
```

---

### Task 8: Final integration — App.tsx prop wiring cleanup

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Passes `preferenceTags`, `onResetPreferences`, `recipeScores` to RecipeList

- [ ] **Step 1: Ensure all props flow from App.tsx to children**

In App.tsx's `<RecipeList>` block, add/verify these props exist:

```tsx
<RecipeList
  // ... existing props ...
  recipeScores={recipeScores}
  preferenceTags={preferenceTags}
  onResetPreferences={engine.reset}
  matchScore={/* not here — this is per-card, handled in RecipeList */}
/>
```

- [ ] **Step 2: Verify full build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ built in X.XXs`

- [ ] **Step 3: Manually test with dev server**

```bash
npm run dev
```

Manual test checklist:
1. Open app → Discover tab shows no PreferenceBar (cold start, 0 interactions)
2. Click 3 recipes → cold start ends, PreferenceBar appears with "探索中"
3. Favorite a spicy recipe → tag should update to "嗜辣"
4. Browse tab shows recipes sorted by preference (sort toggle defaults to "按口味推荐")
5. Click sort toggle → switches to A-Z → switches back to preference
6. Manual preference picker when collapsed shows the auto-sort hint
7. Search → results sorted by preference
8. Reset → tags vanish, back to cold start
9. FocusMode: cook through >50% steps, exit → interaction recorded

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: complete flavor preference engine integration"
```

---

### Self-Review Checklist

**Done before handing off to user:**

1. **Spec coverage:**
   - [x] Data model (Task 1)
   - [x] EMA flavor update with clamping (Task 2)
   - [x] Counter update with floor at 0 (Task 2)
   - [x] Time decay — applied on write, virtual on read (Task 2)
   - [x] Cold start gating + ramp (Task 2)
   - [x] Scoring formula with zero-div guards (Task 2)
   - [x] Sort strategy — all contexts (Task 5)
   - [x] Exploration injection 3+2 (Task 5)
   - [x] PreferenceBar with i18n tags, cold start hidden (Task 4)
   - [x] Sort toggle (Task 5)
   - [x] RecipeCard matchScore dot (Task 6)
   - [x] FocusMode onComplete (Task 7)
   - [x] App.tsx wiring — all interaction handlers (Task 3, 8)
   - [x] Reset (Task 2 engine, Task 4 UI)
   - [x] Non-breaking — existing props unchanged, manual picker preserved (verified across tasks)

2. **Placeholder scan:** No TBDs, TODOs, "add appropriate error handling", or "similar to Task N" references. All steps have concrete code.

3. **Type consistency:**
   - `PreferenceProfile` defined in Task 1, used in Task 2 (engine)
   - `ActionType` defined in Task 1, used in Task 2 (`ACTION_WEIGHTS`), Task 3 (record calls)
   - `FlavorPreference` defined in Task 1, used in Task 2 (INITIAL_FLAVOR, flavor update)
   - `matchScore?: number` in Task 6 matches `recipeScores: Map<string, number>` in Task 3/5
   - `onComplete?: (completionRatio: number) => void` in Task 7 matches `handleFocusComplete(completionRatio: number)` in Task 3
   - `preferenceTags: string[]` in Task 4 matches `engine.generateTags(lang)` in Task 3
   - `onResetPreferences: () => void` in Task 5 matches `engine.reset` in Task 3
   - All translations keys used in Task 4 match keys defined in Task 4 Step 2
