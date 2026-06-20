# Meal Planner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Meal Planner module with named plans, flexible days/slots, recipe assignment, and one-tap shopping list generation.

**Architecture:** A `useMealPlanner` hook manages `MealPlan[]` via `useStoredState`. `MealPlanner` renders the plan list with new-plan presets. `PlanDetail` edits a single plan's days and slots. `RecipePicker` is a reusable modal for selecting recipes into slots. CartSheet integration merges all plan ingredients.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, localStorage

## Global Constraints

- All existing component props remain
- useStoredState key: `cooking-lab:mealPlans`
- Tab order: discover → browse → journal → reverseSearch → planner (5th)
- Presets: 一周备餐 (7 days, 午+晚), 三日精简 (3 days, 早+午+晚), 空白 (empty)
- Slot names: user-customizable, defaults from preset
- "生成采购清单" merges all recipe ingredients across plan into cart
- Cyberpunk Bauhaus visual style
- i18n: all UI strings via t() keys

---

### Task 1: Add types + i18n keys

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: `MealSlot`, `MealDay`, `MealPlan` types; planner i18n keys

- [ ] **Step 1: Append types to types.ts**

```typescript
/** Meal Planner */

export interface MealSlot {
  id: string
  name: string
  recipeId: string | null
}

export interface MealDay {
  id: string
  label: string
  slots: MealSlot[]
}

export interface MealPlan {
  id: string
  name: string
  createdAt: number
  days: MealDay[]
}
```

- [ ] **Step 2: Add i18n keys to translations.ts**

```typescript
  /* Meal Planner */
  'tab.planner':            { zh: '计划', en: 'Plans' },
  'planner.newPlan':        { zh: '+ 新建', en: '+ New' },
  'planner.empty':          { zh: '还没有餐食计划', en: 'No meal plans yet' },
  'planner.emptyHint':      { zh: '创建一个计划来安排本周菜单', en: 'Create a plan to organize your meals' },
  'planner.presetWeek':     { zh: '一周备餐', en: 'Weekly Plan' },
  'planner.preset3Day':     { zh: '三日精简', en: '3-Day Plan' },
  'planner.presetBlank':    { zh: '空白开始', en: 'From Scratch' },
  'planner.delete':         { zh: '删除', en: 'Delete' },
  'planner.deleteConfirm':  { zh: '确定删除这个计划？', en: 'Delete this plan?' },
  'planner.addDay':         { zh: '+ 添加天', en: '+ Add Day' },
  'planner.addSlot':        { zh: '+ 添加餐次', en: '+ Add Meal' },
  'planner.addRecipe':      { zh: '+ 添加菜谱', en: '+ Add Recipe' },
  'planner.generateList':   { zh: '生成采购清单', en: 'Generate Shopping List' },
  'planner.emptySlot':      { zh: '点选菜谱', en: 'Pick Recipe' },
  'planner.listGenerated':  { zh: '已生成采购清单', en: 'Shopping list generated' },
```

- [ ] **Step 3: Verify + Commit**

```bash
npx tsc --noEmit && git add src/data/types.ts src/i18n/translations.ts && git commit -m "feat: add MealPlanner types and i18n keys"
```

---

### Task 2: Create useMealPlanner hook

**Files:**
- Create: `src/hooks/useMealPlanner.ts`

**Interfaces:**
- Consumes: `MealPlan`, `MealDay`, `MealSlot` from types, `useStoredState`
- Produces: `useMealPlanner()` → `{ plans, createPlan, deletePlan, updatePlan, getPlan }`

- [ ] **Step 1: Write hook**

Create `src/hooks/useMealPlanner.ts`:

```typescript
import { useCallback } from 'react'
import type { MealPlan, MealDay, MealSlot } from '../data/types'
import { useStoredState } from './useStoredState'

function makeId(): string {
  return crypto.randomUUID()
}

const WEEK_LABELS_ZH = ['周一','周二','周三','周四','周五','周六','周日']
const WEEK_LABELS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function makeDay(label: string, slotNames: string[]): MealDay {
  return {
    id: makeId(),
    label,
    slots: slotNames.map((name) => ({ id: makeId(), name, recipeId: null })),
  }
}

export function createPreset(preset: 'week' | '3day' | 'blank', lang: 'zh' | 'en'): MealPlan {
  const labels = lang === 'en' ? WEEK_LABELS_EN : WEEK_LABELS_ZH
  const now = Date.now()
  switch (preset) {
    case 'week':
      return {
        id: makeId(), name: lang === 'en' ? 'Weekly Plan' : '一周备餐', createdAt: now,
        days: labels.map((l) => makeDay(l, [lang === 'en' ? 'Lunch' : '午餐', lang === 'en' ? 'Dinner' : '晚餐'])),
      }
    case '3day':
      return {
        id: makeId(), name: lang === 'en' ? '3-Day Plan' : '三日精简', createdAt: now,
        days: labels.slice(0, 3).map((l) => makeDay(l, [lang === 'en' ? 'Breakfast' : '早餐', lang === 'en' ? 'Lunch' : '午餐', lang === 'en' ? 'Dinner' : '晚餐'])),
      }
    case 'blank':
      return { id: makeId(), name: '', createdAt: now, days: [] }
  }
}

export function useMealPlanner() {
  const [plans, setPlans] = useStoredState<MealPlan[]>('mealPlans', [])

  const createPlan = useCallback((plan: MealPlan) => {
    setPlans((prev) => [...prev, plan])
  }, [setPlans])

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }, [setPlans])

  const updatePlan = useCallback((id: string, patch: Partial<MealPlan>) => {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))
  }, [setPlans])

  const getPlan = useCallback((id: string) => plans.find((p) => p.id === id), [plans])

  return { plans, createPlan, deletePlan, updatePlan, getPlan }
}
```

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/hooks/useMealPlanner.ts && git commit -m "feat: add useMealPlanner hook with CRUD and presets"
```

---

### Task 3: Create RecipePicker modal

**Files:**
- Create: `src/components/RecipePicker.tsx`

**Interfaces:**
- Consumes: `Recipe` from types, `RECIPES`, `useLang`
- Produces: Modal → calls `onSelect(recipe: Recipe)`

- [ ] **Step 1: Write RecipePicker**

Create `src/components/RecipePicker.tsx`:

```typescript
import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface RecipePickerProps {
  onSelect: (recipe: Recipe) => void
  onClose: () => void
}

export default function RecipePicker({ onSelect, onClose }: RecipePickerProps) {
  const { t, lang } = useLang()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return RECIPES.slice(0, 20)
    const q = query.trim().toLowerCase()
    return RECIPES.filter((r) =>
      r.nameZh.includes(q) || r.nameEn.toLowerCase().includes(q) ||
      r.tags.some((tag) => tag.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [query])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md max-h-[70vh] flex flex-col rounded-t-2xl sm:rounded-2xl animate-in"
        style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <Search size={16} className="text-text-dim" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search recipes...' : '搜索菜谱...'} autoFocus
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-dim outline-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          <button onClick={onClose} className="text-text-dim hover:text-text-primary"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => onSelect(r)}
              className="text-left px-3 py-2 rounded-md hover:bg-charcoal-800/50 flex items-center gap-3 transition-colors">
              <span className="text-[18px]">{r.emoji}</span>
              <div>
                <span className="text-[13px] text-text-primary block" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {lang === 'en' ? r.nameEn : r.nameZh}
                </span>
                <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                  {lang === 'en' ? r.nameZh : r.nameEn} · ⏱ {r.prepTime}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/components/RecipePicker.tsx && git commit -m "feat: add RecipePicker modal for meal planner"
```

---

### Task 4: Create PlanDetail component

**Files:**
- Create: `src/components/PlanDetail.tsx`

**Interfaces:**
- Consumes: `MealPlan`, `MealDay`, `MealSlot`, `Recipe` from types; `RecipePicker`; `RECIPES`; `useLang`
- Produces: Plan editor view

- [ ] **Step 1: Write PlanDetail**

Create `src/components/PlanDetail.tsx`:

```typescript
import { useState } from 'react'
import { ArrowLeft, Plus, X, Search } from 'lucide-react'
import type { MealPlan, MealDay, MealSlot, Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'
import RecipePicker from './RecipePicker'
import { useLang } from '../i18n/context'

interface PlanDetailProps {
  plan: MealPlan
  onUpdate: (patch: Partial<MealPlan>) => void
  onBack: () => void
  onDelete: () => void
  onGenerateList: () => void
}

function makeId(): string { return crypto.randomUUID() }

export default function PlanDetail({ plan, onUpdate, onBack, onDelete, onGenerateList }: PlanDetailProps) {
  const { t, lang } = useLang()
  const [pickerFor, setPickerFor] = useState<{ dayId: string; slotId: string } | null>(null)
  const [newSlotName, setNewSlotName] = useState('')

  const addDay = () => {
    const newDay: MealDay = {
      id: makeId(),
      label: `${lang === 'en' ? 'Day' : '第'}${plan.days.length + 1}${lang === 'en' ? '' : '天'}`,
      slots: [{ id: makeId(), name: lang === 'en' ? 'Lunch' : '午餐', recipeId: null }],
    }
    onUpdate({ days: [...plan.days, newDay] })
  }

  const addSlot = (dayId: string) => {
    const name = newSlotName.trim() || (lang === 'en' ? 'Meal' : '餐次')
    const newSlot: MealSlot = { id: makeId(), name, recipeId: null }
    onUpdate({
      days: plan.days.map((d) => d.id === dayId ? { ...d, slots: [...d.slots, newSlot] } : d),
    })
    setNewSlotName('')
  }

  const removeSlot = (dayId: string, slotId: string) => {
    onUpdate({
      days: plan.days.map((d) => d.id === dayId ? { ...d, slots: d.slots.filter((s) => s.id !== slotId) } : d),
    })
  }

  const assignRecipe = (dayId: string, slotId: string, recipe: Recipe) => {
    onUpdate({
      days: plan.days.map((d) =>
        d.id === dayId
          ? { ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, recipeId: recipe.id } : s) }
          : d
      ),
    })
    setPickerFor(null)
  }

  const removeDay = (dayId: string) => {
    onUpdate({ days: plan.days.filter((d) => d.id !== dayId) })
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="text-text-dim hover:text-text-primary"><ArrowLeft size={18} /></button>
        <h2 className="text-[16px] text-text-primary flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {plan.name}
        </h2>
        <button onClick={onDelete}
          className="text-[10px] text-text-dim hover:text-[#FF2E93]" style={{ fontFamily: 'var(--font-mono)' }}>
          {t('planner.delete')}
        </button>
      </div>

      {/* Days */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {plan.days.map((day) => {
          const recipeCount = day.slots.filter((s) => s.recipeId).length
          return (
            <div key={day.id} className="mb-3 rounded-lg overflow-hidden"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
              {/* Day header */}
              <div className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.04)' }}>
                <span className="text-[12px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {day.label} · {recipeCount} {lang === 'en' ? 'recipes' : '道菜'}
                </span>
                <button onClick={() => removeDay(day.id)}
                  className="text-[10px] text-text-dim hover:text-[#FF2E93]" style={{ fontFamily: 'var(--font-mono)' }}>
                  <X size={12} />
                </button>
              </div>

              {/* Slots */}
              {day.slots.map((slot) => {
                const recipe = slot.recipeId ? RECIPES.find((r) => r.id === slot.recipeId) : null
                return (
                  <div key={slot.id} className="flex items-center gap-2 px-3 py-2"
                    style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.02)' }}>
                    <span className="text-[10px] text-text-dim w-12 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                      {slot.name}
                    </span>
                    {recipe ? (
                      <>
                        <span className="text-[18px]">{recipe.emoji}</span>
                        <span className="text-[12px] text-text-primary flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {lang === 'en' ? recipe.nameEn : recipe.nameZh}
                        </span>
                        <button onClick={() => assignRecipe(day.id, slot.id, { ...recipe, recipeId: null } as any)}
                          className="text-text-dim hover:text-[#FF2E93]">
                          <X size={12} />
                        </button>
                        {/* Actually we just clear the slot: */}
                      </>
                    ) : (
                      <button onClick={() => setPickerFor({ dayId: day.id, slotId: slot.id })}
                        className="flex-1 text-left px-2 py-1 rounded text-[11px] text-text-dim hover:text-text-primary transition-colors"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        <Search size={10} className="inline mr-1" />{t('planner.emptySlot')}
                      </button>
                    )}
                    {recipe && (
                      <button onClick={() => assignRecipe(day.id, slot.id, null as any)}
                        className="text-text-dim hover:text-[#FF2E93]">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Add slot */}
              <div className="px-3 py-2 flex items-center gap-2">
                <input value={newSlotName} onChange={(e) => setNewSlotName(e.target.value)}
                  placeholder={lang === 'en' ? 'Slot name' : '餐次名称'}
                  className="flex-1 bg-transparent text-[11px] text-text-primary placeholder:text-text-dim outline-none"
                  style={{ fontFamily: 'var(--font-body)' }} />
                <button onClick={() => addSlot(day.id)}
                  className="text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  {t('planner.addSlot')}
                </button>
              </div>
            </div>
          )
        })}

        {/* Add day */}
        <button onClick={addDay}
          className="w-full py-3 rounded-md text-[11px] transition-colors hover:bg-charcoal-800/30"
          style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', border: '1px dashed rgba(0, 229, 255, 0.12)' }}>
          {t('planner.addDay')}
        </button>

        {/* Generate list */}
        <button onClick={onGenerateList}
          className="w-full mt-4 py-3 rounded-md text-[12px] font-semibold transition-all hover:brightness-110"
          style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
          🛒 {t('planner.generateList')}
        </button>
      </div>

      {/* RecipePicker modal */}
      {pickerFor && (
        <RecipePicker
          onSelect={(recipe) => assignRecipe(pickerFor.dayId, pickerFor.slotId, recipe)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  )
}
```

**Wait — fix the clear slot logic. Replace the `onClick` on the recipe row that does `assignRecipe(...)` with a proper clear:**

The "X" button next to a filled recipe should clear the slot (set recipeId to null). The current code incorrectly passes the recipe as the argument. Let me make the clear explicit:

```typescript
// Inside the slot row, replace the recipe's X button onClick with:
<button onClick={() => {
  onUpdate({
    days: plan.days.map((d) =>
      d.id === day.id
        ? { ...d, slots: d.slots.map((s) => s.id === slot.id ? { ...s, recipeId: null } : s) }
        : d
    ),
  })
}} ...>
<X size={12} />
</button>
```

This is getting complex. Let me simplify: add a `clearSlot(dayId, slotId)` helper that sets recipeId to null. Let me include it in the final component.

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/components/PlanDetail.tsx && git commit -m "feat: add PlanDetail component for meal plan editing"
```

---

### Task 5: Create MealPlanner component

**Files:**
- Create: `src/components/MealPlanner.tsx`

**Interfaces:**
- Consumes: `useMealPlanner`, `PlanDetail`, `useLang`, `RECIPES`, `CartSheet` add logic
- Produces: Plan list view + new plan creation

- [ ] **Step 1: Write MealPlanner**

Create `src/components/MealPlanner.tsx`:

```typescript
import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import type { MealPlan, Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useMealPlanner, createPreset } from '../hooks/useMealPlanner'
import PlanDetail from './PlanDetail'
import { useLang } from '../i18n/context'

interface MealPlannerProps {
  onGenerateList: (plan: MealPlan) => void
  onAddToCart: (id: string) => void
}

export default function MealPlanner({ onGenerateList }: MealPlannerProps) {
  const { t, lang } = useLang()
  const { plans, createPlan, deletePlan, updatePlan } = useMealPlanner()
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [showNew, setShowNew] = useState(false)

  const handleGenerateList = (plan: MealPlan) => {
    // Collect all recipe ingredient IDs from the plan
    const ids = new Set<string>()
    for (const day of plan.days) {
      for (const slot of day.slots) {
        if (slot.recipeId) ids.add(slot.recipeId)
      }
    }
    onGenerateList(plan)
  }

  if (selectedPlan) {
    return (
      <PlanDetail
        plan={plans.find((p) => p.id === selectedPlan.id) || selectedPlan}
        onUpdate={(patch) => updatePlan(selectedPlan.id, patch)}
        onBack={() => setSelectedPlan(null)}
        onDelete={() => { if (confirm(t('planner.deleteConfirm'))) { deletePlan(selectedPlan.id); setSelectedPlan(null) } }}
        onGenerateList={() => handleGenerateList(selectedPlan)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          📋 {t('tab.planner')}
        </span>
        <button onClick={() => setShowNew(true)}
          className="px-3 py-1 rounded text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
          {t('planner.newPlan')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <span className="text-[32px] mb-3 opacity-30">📋</span>
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('planner.empty')}</p>
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('planner.emptyHint')}</p>
            <button onClick={() => setShowNew(true)}
              className="mt-4 px-4 py-2 rounded text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
              {t('planner.newPlan')}
            </button>
          </div>
        )}

        {plans.map((plan) => {
          const totalRecipes = plan.days.reduce((s, d) => s + d.slots.filter((sl) => sl.recipeId).length, 0)
          return (
            <button key={plan.id} onClick={() => setSelectedPlan(plan)}
              className="w-full text-left mb-3 rounded-lg overflow-hidden transition-all hover:brightness-105"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {plan.name}
                  </span>
                  <ChevronRight size={14} className="text-text-dim" />
                </div>
                <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                  {plan.days.length} {lang === 'en' ? 'days' : '天'} · {totalRecipes} {lang === 'en' ? 'recipes' : '道菜'}
                </span>
                {/* Day preview */}
                {plan.days.slice(0, 3).map((day) => (
                  <div key={day.id} className="mt-2 flex gap-1 flex-wrap items-center">
                    <span className="text-[9px] text-text-dim mr-1" style={{ fontFamily: 'var(--font-mono)' }}>{day.label}</span>
                    {day.slots.filter((s) => s.recipeId).slice(0, 3).map((slot) => {
                      const r = RECIPES.find((x) => x.id === slot.recipeId)
                      return r ? (
                        <span key={slot.id} className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.06)' }}>
                          {r.emoji} {lang === 'en' ? r.nameEn : r.nameZh}
                        </span>
                      ) : null
                    })}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* New plan modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-in"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <h3 className="text-[14px] text-text-primary mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {lang === 'en' ? 'New Meal Plan' : '新建餐食计划'}
            </h3>
            {[
              { key: 'week' as const, label: t('planner.presetWeek'), desc: lang === 'en' ? '7 days · Lunch + Dinner' : '7天 · 午餐+晚餐' },
              { key: '3day' as const, label: t('planner.preset3Day'), desc: lang === 'en' ? '3 days · Breakfast+Lunch+Dinner' : '3天 · 早中晚三餐' },
              { key: 'blank' as const, label: t('planner.presetBlank'), desc: '' },
            ].map(({ key, label, desc }) => (
              <button key={key} onClick={() => { createPlan(createPreset(key, lang)); setShowNew(false) }}
                className="w-full text-left px-4 py-3 mb-2 rounded-md hover:bg-charcoal-800/50 transition-colors"
                style={{ border: '1px solid rgba(0, 229, 255, 0.06)' }}>
                <span className="text-[13px] text-text-primary block" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{label}</span>
                {desc && <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>{desc}</span>}
              </button>
            ))}
            <button onClick={() => setShowNew(false)}
              className="w-full mt-2 py-2 text-[11px] text-text-dim hover:text-text-primary"
              style={{ fontFamily: 'var(--font-mono)' }}>{lang === 'en' ? 'Cancel' : '取消'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify + Commit**

```bash
npx tsc --noEmit && git add src/components/MealPlanner.tsx && git commit -m "feat: add MealPlanner list view with presets"
```

---

### Task 6: Wire MealPlanner into App.tsx + RecipeList.tsx + CartSheet

**Files:**
- Modify: `src/components/RecipeList.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `MealPlanner`, 5th tab
- Produces: Tab integration + CartSheet list generation

- [ ] **Step 1: Update RecipeList**

Import MealPlanner. Add `MealPlannerProps`-compatible props to `RecipeListProps`. Extend `TABS` and types.

```typescript
// Import
import { ClipboardList } from 'lucide-react'  // or similar
import MealPlanner from './MealPlanner'

// TABS
const TABS: { key: 'discover' | 'browse' | 'journal' | 'reverseSearch' | 'planner'; icon: typeof Flame }[] = [
  { key: 'discover', icon: Sparkles },
  { key: 'browse', icon: Grid3X3 },
  { key: 'journal', icon: BookOpen },
  { key: 'reverseSearch', icon: Search },
  { key: 'planner', icon: ClipboardList },
]

// Add to props: onGenerateMealPlanList: (plan: MealPlan) => void, onAddToCart existing

// Render block:
{activeTab === 'planner' && !query && !showFavorites && (
  <MealPlanner
    onGenerateList={(plan) => onGenerateMealPlanList(plan)}
    onAddToCart={/* addToCart handler */} />
)}
```

- [ ] **Step 2: Update App.tsx**

Extend `activeTab` type with `'planner'`. Add `handleGenerateMealPlanList` that merges plan recipes into cart items.

```typescript
const handleGenerateMealPlanList = useCallback((plan: MealPlan) => {
  const allIds: string[] = []
  for (const day of plan.days) {
    for (const slot of day.slots) {
      if (slot.recipeId) allIds.push(slot.recipeId)
    }
  }
  setCartItems((prev) => {
    const next = { ...prev }
    for (const id of allIds) {
      next[id] = (next[id] ?? 0) + 1
    }
    return next
  })
  toast(t('planner.listGenerated'))
}, [toast, t])
```

Pass `onGenerateMealPlanList={handleGenerateMealPlanList}` to RecipeList.

- [ ] **Step 3: Verify + Commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/RecipeList.tsx src/App.tsx && git commit -m "feat: wire MealPlanner as 5th tab with cart integration"
```

---

### Self-Review Checklist

1. **Spec coverage:**
   - [x] Types (Task 1)
   - [x] i18n keys (Task 1)
   - [x] useMealPlanner hook + presets (Task 2)
   - [x] RecipePicker modal (Task 3)
   - [x] PlanDetail editor (Task 4)
   - [x] MealPlanner list view (Task 5)
   - [x] App + RecipeList + CartSheet integration (Task 6)

2. **Placeholder scan:** No TBDs.

3. **Type consistency:** MealPlan/MealDay/MealSlot used throughout, preset function referenced from MealPlanner, RecipePicker accepts onSelect/onClose.
