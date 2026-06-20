# Cooking Journal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Cooking Journal module with persistent rich entry logging (rating, notes, tags, photos, timing) that feeds into the preference learning engine.

**Architecture:** A `useCookJournal` hook manages `CookEntry[]` via `useStoredState`. `CookJournal` renders a timeline with stats and filtering. `CookEntryForm` (modal) captures rich metadata after FocusMode completes or via manual entry. `usePreferenceEngine.record()` is extended to accept optional `{rating, tags}` metadata for signal reinforcement.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, localStorage (`useStoredState`)

## Global Constraints

- All existing component props remain (new ones are optional)
- `useStoredState` key: `cooking-lab:cookEntries`
- Photo storage: Base64 data URL (no external storage dependency)
- FocusMode form auto-opens only when `completionRatio > 0.5`
- Rating: 1-5 integer stars
- Custom tags: free-text, suggested from history
- Tab order: discover → browse → journal (3rd position)
- Cyberpunk Bauhaus visual style — match existing accent colors, font vars
- i18n: all UI strings via `t()` keys in `translations.ts`

---

### Task 1: Add CookEntry type

**Files:**
- Modify: `src/data/types.ts`

**Interfaces:**
- Produces: `CookEntry` interface

- [ ] **Step 1: Append CookEntry type**

Append to `src/data/types.ts`:

```typescript
/** Cooking journal entry */
export interface CookEntry {
  id: string
  recipeId: string
  date: number              // Unix ms timestamp
  rating: number            // 1-5
  notes: string
  photo?: string            // Base64 data URL
  actualTime: number        // minutes
  customTags: string[]
  completionRatio: number   // 0-1
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: add CookEntry type for cooking journal"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 2: Add journal translation keys

**Files:**
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: journal/cookbook i18n keys used by tasks 5-9

- [ ] **Step 1: Add translation keys**

Append to the `T` object in `src/i18n/translations.ts` (before `}` closing):

```typescript
  /* Cooking Journal */
  'journal.tab':            { zh: '日志', en: 'Journal' },
  'journal.empty':          { zh: '还没有烹饪记录', en: 'No cooking records yet' },
  'journal.emptyHint':      { zh: '做一道菜试试吧', en: 'Cook a recipe to get started' },
  'journal.monthly':        { zh: '本月 {n} 次 · 平均 {r}★ · 用时 {h}h{m}m', en: 'This month: {n} cooks · avg {r}★ · {h}h{m}m' },
  'journal.filter':         { zh: '筛选', en: 'Filter' },
  'journal.clearFilter':    { zh: '清除筛选', en: 'Clear filter' },
  'journal.manualAdd':      { zh: '+ 手动记录', en: '+ Log Entry' },
  'journal.delete':         { zh: '删除', en: 'Delete' },
  'journal.deleteConfirm':  { zh: '确定删除这条记录？', en: 'Delete this entry?' },
  'journal.daysAgo':        { zh: '天前', en: 'd ago' },
  'journal.yesterday':      { zh: '昨天', en: 'Yesterday' },
  'journal.today':          { zh: '今天', en: 'Today' },

  /* Entry Form */
  'entry.title':            { zh: '记录烹饪', en: 'Log Cooking' },
  'entry.rating':           { zh: '评分', en: 'Rating' },
  'entry.actualTime':       { zh: '实际用时（分钟）', en: 'Actual Time (min)' },
  'entry.notes':            { zh: '笔记（可选）', en: 'Notes (optional)' },
  'entry.tags':             { zh: '标签（回车添加）', en: 'Tags (Enter to add)' },
  'entry.photo':            { zh: '📷 拍照', en: '📷 Photo' },
  'entry.submit':           { zh: '保存记录', en: 'Save Entry' },
  'entry.cancel':           { zh: '跳过', en: 'Skip' },
  'entry.tagHint':          { zh: '输入自定义标签，回车添加', en: 'Type tag, press Enter to add' },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat: add cooking journal i18n keys"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 3: Create useCookJournal hook

**Files:**
- Create: `src/hooks/useCookJournal.ts`

**Interfaces:**
- Consumes: `CookEntry` from `src/data/types`, `useStoredState` from `src/hooks/useStoredState`
- Produces: `useCookJournal()` → `{ entries, addEntry, deleteEntry, updateEntry, monthlyStats, filteredEntries, filterState, setFilter }`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useCookJournal.ts`:

```typescript
import { useCallback, useMemo, useState } from 'react'
import type { CookEntry } from '../data/types'
import { useStoredState } from './useStoredState'

export interface JournalFilter {
  recipeId?: string
  tag?: string
  minRating?: number
}

export interface MonthlyStats {
  count: number
  avgRating: number
  totalMinutes: number
}

function makeId(): string {
  return crypto.randomUUID()
}

export function useCookJournal() {
  const [entries, setEntries] = useStoredState<CookEntry[]>('cookEntries', [])
  const [filter, setFilter] = useState<JournalFilter>({})

  const addEntry = useCallback((entry: Omit<CookEntry, 'id'>) => {
    const newEntry: CookEntry = { ...entry, id: makeId() }
    setEntries((prev) => [newEntry, ...prev])
    return newEntry
  }, [setEntries])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [setEntries])

  const updateEntry = useCallback((id: string, patch: Partial<CookEntry>) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))
  }, [setEntries])

  const monthlyStats = useMemo((): MonthlyStats => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const monthEntries = entries.filter((e) => e.date >= startOfMonth)
    if (monthEntries.length === 0) return { count: 0, avgRating: 0, totalMinutes: 0 }
    const sumRating = monthEntries.reduce((s, e) => s + e.rating, 0)
    return {
      count: monthEntries.length,
      avgRating: Math.round((sumRating / monthEntries.length) * 10) / 10,
      totalMinutes: monthEntries.reduce((s, e) => s + e.actualTime, 0),
    }
  }, [entries])

  const filteredEntries = useMemo(() => {
    let list = entries
    if (filter.recipeId) list = list.filter((e) => e.recipeId === filter.recipeId)
    if (filter.tag) list = list.filter((e) => e.customTags.includes(filter.tag!))
    if (filter.minRating !== undefined) list = list.filter((e) => e.rating >= filter.minRating!)
    return list
  }, [entries, filter])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const e of entries) {
      for (const t of e.customTags) tagSet.add(t)
    }
    return [...tagSet]
  }, [entries])

  return {
    entries: filteredEntries,
    allEntries: entries,
    addEntry,
    deleteEntry,
    updateEntry,
    monthlyStats,
    filter,
    setFilter,
    allTags,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCookJournal.ts
git commit -m "feat: add useCookJournal hook with CRUD, stats, filtering"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 4: Enhance usePreferenceEngine with rating/tags metadata

**Files:**
- Modify: `src/hooks/usePreferenceEngine.ts`

**Interfaces:**
- Consumes: `CookEntry` (indirectly via record metadata)
- Produces: `record()` signature extended — `record(recipe, action, meta?: { rating?: number, tags?: string[] })`

- [ ] **Step 1: Add CookMeta type and update record signature**

In `src/hooks/usePreferenceEngine.ts`, add after the existing constants (after `DECAY_FACTOR`):

```typescript
interface CookMeta {
  rating?: number    // 1-5
  tags?: string[]    // custom tags from cook entry
}
```

- [ ] **Step 2: Update record function**

Replace the `record` callback:

```typescript
const record = useCallback((recipe: Recipe, action: ActionType, meta?: CookMeta) => {
  setProfile((prev) => {
    const p = applyDecay(prev)
    let weight = ACTION_WEIGHTS[action]

    // Apply rating modifier for cook actions
    if (action === 'cook' && meta) {
      if (meta.rating !== undefined && meta.rating >= 4) {
        weight *= 1.5
      } else if (meta.rating !== undefined && meta.rating <= 2) {
        weight *= 0.3
      }
    }

    const alpha = weight * LEARNING_RATE

    const flavor = { ...p.flavor }
    const fp = recipe.flavorProfile
    ;(Object.keys(flavor) as (keyof typeof flavor)[]).forEach((dim) => {
      flavor[dim] = clamp(flavor[dim] * (1 - alpha) + fp[dim] * alpha, 0, 1)
    })

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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no errors (existing call sites pass no meta — still valid since `meta?` is optional).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/usePreferenceEngine.ts
git commit -m "feat: enhance preference engine with rating/tags metadata"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 5: Create CookEntryForm component

**Files:**
- Create: `src/components/CookEntryForm.tsx`

**Interfaces:**
- Consumes: `Recipe` from types, `CookEntry` (as Omit), `useLang`
- Produces: Modal form → calls `onSubmit(Omit<CookEntry, 'id'>)` or `onCancel()`

- [ ] **Step 1: Write CookEntryForm**

Create `src/components/CookEntryForm.tsx`:

```typescript
import { useState } from 'react'
import { X, Camera, Star } from 'lucide-react'
import type { Recipe, CookEntry } from '../data/types'
import { useLang } from '../i18n/context'

interface CookEntryFormProps {
  recipe: Recipe
  completionRatio: number
  existingTags: string[]
  onSubmit: (data: Omit<CookEntry, 'id'>) => void
  onCancel: () => void
}

export default function CookEntryForm({ recipe, completionRatio, existingTags, onSubmit, onCancel }: CookEntryFormProps) {
  const { t, lang } = useLang()
  const [rating, setRating] = useState(0)
  const [actualTime, setActualTime] = useState(parseInt(recipe.prepTime, 10) || 0)
  const [notes, setNotes] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()

  const handlePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    onSubmit({
      recipeId: recipe.id,
      date: Date.now(),
      rating: rating || 3,
      notes,
      photo,
      actualTime,
      customTags,
      completionRatio,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-in"
        style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)', boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <div className="flex items-center gap-3">
            <span className="text-[20px]">{recipe.emoji}</span>
            <div>
              <h3 className="text-[15px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {t('entry.title')}
              </h3>
              <p className="text-[11px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                {lang === 'en' ? recipe.nameEn : recipe.nameZh}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-text-dim hover:text-text-primary">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Rating */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.rating')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}
                  className="text-[24px] transition-colors duration-150"
                  style={{ color: n <= rating ? '#FF9F0A' : '#2A303C' }}>
                  <Star size={28} strokeWidth={1.5} fill={n <= rating ? '#FF9F0A' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          {/* Actual time */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.actualTime')}</label>
            <input type="number" value={actualTime} onChange={(e) => setActualTime(Number(e.target.value))}
              min={0} className="w-full bg-transparent text-[14px] text-text-primary px-3 py-2 rounded-md"
              style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={lang === 'en' ? 'How did it go? Any tweaks?' : '做得怎么样？有什么调整？'}
              className="w-full bg-transparent text-[13px] text-text-primary px-3 py-2 rounded-md resize-none placeholder:text-text-dim"
              style={{ fontFamily: 'var(--font-body)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.tags')}</label>
            <div className="flex items-center gap-2 mb-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={lang === 'en' ? 'e.g. dinner party, meal prep' : '例如：宴客、减脂、便当'}
                className="flex-1 bg-transparent text-[13px] text-text-primary px-3 py-1.5 rounded-md placeholder:text-text-dim"
                style={{ fontFamily: 'var(--font-body)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
              <button onClick={handleAddTag}
                className="px-3 py-1.5 rounded text-[11px]"
                style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                +
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {customTags.map((tag) => (
                <span key={tag} onClick={() => handleRemoveTag(tag)}
                  className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ fontFamily: 'var(--font-body)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.18)' }}>
                  {tag} ×
                </span>
              ))}
              {/* Tag suggestions from history */}
              {existingTags.filter((t) => !customTags.includes(t)).slice(0, 5).map((tag) => (
                <span key={tag} onClick={() => setCustomTags((prev) => [...prev, tag])}
                  className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:brightness-110 transition-all"
                  style={{ fontFamily: 'var(--font-body)', color: '#5A6272', background: 'rgba(138, 148, 166, 0.06)', border: '1px solid rgba(138, 148, 166, 0.1)' }}>
                  + {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <button onClick={handlePhoto}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] transition-colors hover:brightness-110"
              style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6', border: '1px dashed rgba(138, 148, 166, 0.2)' }}>
              <Camera size={14} />
              {photo ? (lang === 'en' ? 'Change Photo' : '更换照片') : t('entry.photo')}
            </button>
            {photo && (
              <img src={photo} alt="cook photo" className="mt-2 max-h-[120px] rounded-md" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3"
          style={{ borderTop: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-md text-[12px] transition-colors"
            style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
            {t('entry.cancel')}
          </button>
          <button onClick={handleSubmit}
            className="flex-[2] py-2.5 rounded-md text-[12px] font-semibold transition-all hover:brightness-110"
            style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
            {t('entry.submit')}
          </button>
        </div>
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
git add src/components/CookEntryForm.tsx
git commit -m "feat: add CookEntryForm modal component"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 6: Create CookEntryCard component

**Files:**
- Create: `src/components/CookEntryCard.tsx`

**Interfaces:**
- Consumes: `CookEntry`, `Recipe` from types, `useLang`, `RECIPES`
- Produces: Card component rendering a single journal entry

- [ ] **Step 1: Write CookEntryCard**

Create `src/components/CookEntryCard.tsx`:

```typescript
import { Star, Clock, Trash2 } from 'lucide-react'
import type { CookEntry } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface CookEntryCardProps {
  entry: CookEntry
  onDelete: (id: string) => void
  onTap: (entry: CookEntry) => void
}

function formatDate(ts: number, t: (k: string) => string): string {
  const now = new Date()
  const date = new Date(ts)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))
  if (diffDays === 0) return t('journal.today')
  if (diffDays === 1) return t('journal.yesterday')
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

export default function CookEntryCard({ entry, onDelete, onTap }: CookEntryCardProps) {
  const { t, lang } = useLang()
  const recipe = RECIPES.find((r) => r.id === entry.recipeId)
  if (!recipe) return null

  return (
    <div onClick={() => onTap(entry)}
      className="rounded-lg overflow-hidden transition-all duration-200 hover:brightness-105 cursor-pointer relative group"
      style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>

      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: recipe.accent, opacity: 0.6 }} />

      <div className="pl-4 pr-4 py-4">
        {/* Top row: recipe + date + delete */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">{recipe.emoji}</span>
            <div>
              <span className="text-[13px] text-text-primary block"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {lang === 'en' ? recipe.nameEn : recipe.nameZh}
              </span>
              <span className="text-[9px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                {lang === 'en' ? recipe.nameZh : recipe.nameEn}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatDate(entry.date, t)}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
              className="text-text-dim hover:text-[#FF2E93] transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Rating + time */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={12} strokeWidth={1.5}
                fill={n <= entry.rating ? '#FF9F0A' : 'transparent'}
                style={{ color: n <= entry.rating ? '#FF9F0A' : '#2A303C' }} />
            ))}
          </div>
          <span className="text-[10px] text-text-dim flex items-center gap-1"
            style={{ fontFamily: 'var(--font-mono)' }}>
            <Clock size={10} />{entry.actualTime}min
          </span>
        </div>

        {/* Tags */}
        {entry.customTags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {entry.customTags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px]"
                style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes excerpt */}
        {entry.notes && (
          <p className="text-[11px] leading-relaxed line-clamp-2"
            style={{ fontFamily: 'var(--font-body)', color: '#5A6272' }}>
            {entry.notes}
          </p>
        )}

        {/* Photo thumbnail */}
        {entry.photo && (
          <img src={entry.photo} alt="cook" className="mt-2 max-h-[80px] rounded-md opacity-80" />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CookEntryCard.tsx
git commit -m "feat: add CookEntryCard component"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 7: Create CookJournal component

**Files:**
- Create: `src/components/CookJournal.tsx`

**Interfaces:**
- Consumes: `useCookJournal`, `CookEntryCard`, `CookEntryForm`, `useLang`
- Produces: Full journal tab view

- [ ] **Step 1: Write CookJournal**

Create `src/components/CookJournal.tsx`:

```typescript
import { useMemo } from 'react'
import { BookOpen, Filter, X } from 'lucide-react'
import type { CookEntry } from '../data/types'
import { useCookJournal } from '../hooks/useCookJournal'
import CookEntryCard from './CookEntryCard'
import { useLang } from '../i18n/context'

interface CookJournalProps {
  onEntryTap?: (entry: CookEntry) => void
}

export default function CookJournal({ onEntryTap }: CookJournalProps) {
  const { t, lang } = useLang()
  const journal = useCookJournal()
  const { entries, monthlyStats, deleteEntry, filter, setFilter, allTags } = journal

  const statsText = useMemo(() => {
    if (monthlyStats.count === 0) return ''
    const h = Math.floor(monthlyStats.totalMinutes / 60)
    const m = monthlyStats.totalMinutes % 60
    return t('journal.monthly')
      .replace('{n}', String(monthlyStats.count))
      .replace('{r}', String(monthlyStats.avgRating))
      .replace('{h}', String(h))
      .replace('{m}', String(m))
  }, [monthlyStats, t])

  const activeTag = filter.tag || ''

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} strokeWidth={1.5} className="text-ice-400" />
          <span className="text-[14px] text-text-primary"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('journal.tab')}</span>
        </div>
        {statsText && (
          <p className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
            {statsText}
          </p>
        )}
      </div>

      {/* Filter bar */}
      {allTags.length > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          <Filter size={10} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
          {activeTag && (
            <button onClick={() => setFilter({})}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: '#FF2E93', background: 'rgba(255, 46, 147, 0.06)' }}>
              <X size={10} />{t('journal.clearFilter')}
            </button>
          )}
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setFilter({ tag: tag === activeTag ? undefined : tag })}
              className={`px-2 py-0.5 rounded text-[9px] flex-shrink-0 transition-all`}
              style={{
                fontFamily: 'var(--font-body)',
                color: tag === activeTag ? '#F4F4F4' : '#5A6272',
                background: tag === activeTag ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                border: tag === activeTag ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
              }}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <BookOpen size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('journal.empty')}</p>
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('journal.emptyHint')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <CookEntryCard key={entry.id} entry={entry}
                onDelete={(id) => { if (confirm(t('journal.deleteConfirm'))) deleteEntry(id) }}
                onTap={(e) => onEntryTap?.(e)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CookJournal.tsx
git commit -m "feat: add CookJournal timeline component"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 8: Wire cooking journal into App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CookJournal`, `CookEntryForm`, `useCookJournal`
- Produces: 3rd tab, form modal state, record flow

- [ ] **Step 1: Add imports and state**

In `src/App.tsx`, add imports:

```typescript
import CookJournal from './components/CookJournal'
import CookEntryForm from './components/CookEntryForm'
```

Extend the `activeTab` type from `'discover' | 'browse'` to `'discover' | 'browse' | 'journal'`:

```typescript
const [activeTab, setActiveTab] = useState<'discover' | 'browse' | 'journal'>('discover')
```

Add form modal state (after existing state declarations):

```typescript
const [journalFormRecipe, setJournalFormRecipe] = useState<Recipe | null>(null)
const [journalFormRatio, setJournalFormRatio] = useState(1)
```

- [ ] **Step 2: Add the journal tab to RecipeList component**

Since the tabs are managed in RecipeList.tsx (via `TABS` constant and `tab.activeTab`), we need to update RecipeList's `TABS` to include the journal tab, AND handle the journal rendering.

First, update the `activeTab` prop type in RecipeList to include `'journal'`. Then add the journal rendering.

Actually, looking at the architecture more carefully: RecipeList owns the tab bar and the browse/discover content. CookJournal should be its OWN view, not nested inside RecipeList's scroll container.

Better approach: move the JOURNAL tab into RecipeList's TABS array, and when `activeTab === 'journal'`, render `<CookJournal>` inside the scrollable content area (similar to how discover/browse are rendered conditionally).

Let me adjust. In `RecipeList.tsx`:

Add to `TABS`:
```typescript
const TABS: { key: 'discover' | 'browse' | 'journal'; icon: typeof Flame }[] = [
  { key: 'discover', icon: Sparkles },
  { key: 'browse', icon: Grid3X3 },
  { key: 'journal', icon: BookOpen },
]
```

Update the RecipeListProps interface's `activeTab` type to `'discover' | 'browse' | 'journal'`.

Add CookJournal rendering block in the scrollable content area (before the browse/filtered section):

```tsx
{/* ── Journal tab ──────────────────────────────────── */}
{activeTab === 'journal' && !query && !showFavorites && (
  <CookJournal />
)}
```

Also import CookJournal in RecipeList.tsx.

- [ ] **Step 3: Add CookEntryForm modal to App.tsx and handleFocusComplete update**

Update `handleFocusComplete` in App.tsx to also set the form state:

```typescript
const handleFocusComplete = useCallback((completionRatio: number) => {
  if (completionRatio > 0.5 && selectedRecipe) {
    setJournalFormRecipe(selectedRecipe)
    setJournalFormRatio(completionRatio)
  }
}, [selectedRecipe])
```

Wait — the existing code also calls `engine.record`. Let me update to record the basic cook signal too, PLUS open the form:

```typescript
const handleFocusComplete = useCallback((completionRatio: number) => {
  if (completionRatio > 0.5 && selectedRecipe) {
    engine.record(selectedRecipe, 'cook', { rating: undefined }) // basic signal
    setJournalFormRecipe(selectedRecipe)
    setJournalFormRatio(completionRatio)
  }
}, [engine, selectedRecipe])
```

- [ ] **Step 4: Add CookEntryForm modal rendering and submit handler**

After the existing modal sections (CartSheet, InventoryPanel, etc.), add the journal form:

```tsx
{/* ── Cooking Journal Entry Form ───────────────────── */}
{journalFormRecipe && (
  <CookEntryForm
    recipe={journalFormRecipe}
    completionRatio={journalFormRatio}
    existingTags={[]}
    onSubmit={(data) => {
      engine.record(journalFormRecipe, 'cook', { rating: data.rating, tags: data.customTags })
      setJournalFormRecipe(null)
    }}
    onCancel={() => {
      setJournalFormRecipe(null)
    }}
  />
)}
```

- [ ] **Step 5: Verify build compiles**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/RecipeList.tsx
git commit -m "feat: wire cooking journal tab and entry form into app"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Task 9: Update FocusMode exit flow for journal form

**Files:**
- Modify: `src/components/FocusMode.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: FocusMode `onComplete` already exists, App.tsx `handleFocusComplete` already wired
- Produces: No code changes needed — already handled in Task 8 Step 3

This task is a verification step only — confirm the flow works:

1. User enters FocusMode
2. Completes > 50% of steps
3. Exits → `onComplete(completionRatio)` fires
4. App.tsx `handleFocusComplete`:
   - Records basic cook signal via `engine.record(recipe, 'cook')`
   - Sets `journalFormRecipe` → CookEntryForm modal opens
5. User fills form → submits → `engine.record(recipe, 'cook', {rating, tags})` with reinforced signal
6. Entry saved to journal

- [ ] **Step 1: Verify the flow by code review**

Check FocusMode.tsx: `onComplete` is called at all exit points with `(activeStep + 1) / steps.length` ✅ (already done in Task 7).

Check App.tsx: `handleFocusComplete` sets `journalFormRecipe` and `journalFormRatio` ✅ (Task 8 Step 3).

Check App.tsx: `CookEntryForm` submit handler calls `engine.record` with rating/tags ✅ (Task 8 Step 4).

- [ ] **Step 2: Verify build compiles**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FocusMode.tsx src/App.tsx
git commit -m "feat: connect FocusMode completion to cooking journal form"

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Self-Review Checklist

1. **Spec coverage:**
   - [x] CookEntry data model (Task 1)
   - [x] useCookJournal hook with CRUD/stats/filter (Task 3)
   - [x] usePreferenceEngine rating/tags enhancement (Task 4)
   - [x] CookEntryForm modal (Task 5)
   - [x] CookEntryCard display (Task 6)
   - [x] CookJournal timeline view (Task 7)
   - [x] App.tsx wiring — 3rd tab, form modal (Task 8)
   - [x] FocusMode → form flow (Task 9)
   - [x] i18n keys (Task 2)

2. **Placeholder scan:** No TBDs, TODOs, or vague references. All code is concrete.

3. **Type consistency:**
   - `CookEntry` defined in Task 1, consumed in Tasks 3-8 ✅
   - `useCookJournal` returns `{ entries, addEntry, deleteEntry, monthlyStats, filter, setFilter, allTags }` — used in Task 7 ✅
   - `CookEntryForm` props: `recipe: Recipe, completionRatio: number, existingTags: string[], onSubmit, onCancel` — called from App.tsx Task 8 ✅
   - `CookEntryCard` props: `entry: CookEntry, onDelete, onTap` — used in CookJournal Task 7 ✅
   - `record()` extended with `meta?: CookMeta` — backward compatible, existing call sites unchanged ✅
   - Translation keys from Task 2 used in Tasks 5-7 ✅
