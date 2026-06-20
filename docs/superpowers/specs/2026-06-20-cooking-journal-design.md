# Cooking Journal — Design Spec

**Date:** 2026-06-20
**Status:** approved
**Depends on:** M1-M3 modules, Preference Learning Engine

## Overview

Add a Cooking Journal module that allows users to log each cooking session with rich metadata (rating, notes, photos, custom tags, actual time). The journal feeds back into the preference learning engine as a reinforced signal source.

## Data Model

### CookEntry

```typescript
interface CookEntry {
  id: string              // crypto.randomUUID()
  recipeId: string         // FK → Recipe.id
  date: number             // Unix ms timestamp
  rating: number           // 1-5 stars
  notes: string            // free-text
  photo?: string           // Base64 data URL (optional)
  actualTime: number       // minutes
  customTags: string[]     // e.g. ["宴客", "减脂", "工作日"]
  completionRatio: number  // 0-1, from FocusMode
}
```

### Persistence

- localStorage key: `cooking-lab:cookEntries`
- Type: `CookEntry[]`
- Reuses existing `useStoredState` pattern

### Preference Engine Enhancement

| Condition | Modifier |
|-----------|----------|
| rating ≥ 4 | cook weight × 1.5 |
| rating ≤ 2 | apply negative signal, weight × 0.3 |
| customTags present | feed into tag preference tracking |

The `record()` method accepts optional `{ rating?: number, tags?: string[] }` metadata.

## UI Architecture

### Entry Points

1. **Main "日志" Tab** — third top-level tab alongside Discover (发现) and Browse (浏览)
2. **FocusMode completion popup** — after finishing cooking, a modal form auto-opens with pre-filled recipe, date, and completion ratio

### Views

#### 1. CookJournal (main tab)

- Monthly stats bar: "本月 12 次烹饪 · 平均 4.2★ · 总耗时 8.5h"
- Filter bar: by recipe name, custom tags, rating range
- Timeline list: `CookEntryCard[]` sorted by date DESC
- Empty state: illustration + "开始烹饪第一条菜谱吧" CTA

#### 2. CookEntryCard

- Left accent strip (recipe accent color)
- Emoji + recipe name (Chinese + English subtitle)
- Date (relative: "3天前" / "昨天" / "6月18日")
- Star rating (1-5 filled/empty stars)
- Custom tag badges
- Notes excerpt (first 2 lines, expandable)
- Photo thumbnail (if present)
- Swipe left to delete

#### 3. CookEntryForm (modal)

- Triggered by: FocusMode completion OR "手动记录" button in journal
- Pre-filled: recipe, date (today), completionRatio (from FocusMode or 1.0)
- User input fields:
  - Rating: 5 tappable stars
  - Actual time: number input (minutes)
  - Notes: textarea
  - Custom tags: free input + suggestions from history
  - Photo: camera/gallery button (optional)
- Submit → saves entry, triggers engine.record(recipe, 'cook', { rating, tags })
- Cancel → just records basic cook signal (existing behavior)

## Component Structure

```
New files:
  src/hooks/useCookJournal.ts        # CRUD, stats, filtering
  src/components/CookJournal.tsx     # Main tab view
  src/components/CookEntryCard.tsx   # Single entry card
  src/components/CookEntryForm.tsx   # Entry form modal

Modified files:
  src/App.tsx                        # Add tab, routing, form modal state
  src/components/FocusMode.tsx       # onComplete → open form
  src/hooks/usePreferenceEngine.ts   # record() optional metadata param
  src/data/types.ts                  # CookEntry interface
  src/i18n/translations.ts           # New translation keys
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `useCookJournal` | CookEntry[] CRUD, monthly stats computation, filter/sort logic |
| `CookJournal` | Tab content: stats bar, filter bar, timeline list, empty state |
| `CookEntryCard` | Entry display: recipe info, rating stars, tags, notes excerpt, photo, swipe-delete |
| `CookEntryForm` | Modal form: rating stars, time input, notes textarea, tag input, photo picker, submit/cancel |

## Integration Points

### With FocusMode
- FocusMode already has `onComplete(completionRatio)` — this gets extended to also set state in App.tsx to open the entry form modal
- If completionRatio > 0.5 → auto-open form after exit animation
- If completionRatio ≤ 0.5 → just record basic cook signal, no form

### With PreferenceEngine
- `record()` signature extended: `record(recipe, action, meta?: { rating?: number, tags?: string[] })`
- Internal logic applies modifiers based on rating and tags
- Backward compatible: existing `record(recipe, 'view')` calls unchanged

### With RecipeList
- "日志" tab shows in the same tab bar
- Tab state extended: `'discover' | 'browse' | 'journal'`

## Translation Keys Needed

```
journal.tab           { zh: '日志', en: 'Journal' }
journal.empty         { zh: '还没有烹饪记录', en: 'No cooking records yet' }
journal.emptyHint     { zh: '做一道菜试试吧', en: 'Cook a recipe to get started' }
journal.stats         { zh: '本月 {n} 次烹饪 · 平均 {r}★ · 总耗时 {h}h', en: '...' }
journal.filter        { zh: '筛选', en: 'Filter' }
journal.manualAdd     { zh: '手动记录', en: 'Log Entry' }
journal.delete        { zh: '删除', en: 'Delete' }
journal.deleteConfirm { zh: '确定删除这条记录？', en: 'Delete this entry?' }
entry.rating          { zh: '评分', en: 'Rating' }
entry.actualTime      { zh: '实际用时', en: 'Actual Time' }
entry.notes           { zh: '笔记', en: 'Notes' }
entry.tags            { zh: '标签', en: 'Tags' }
entry.photo           { zh: '照片', en: 'Photo' }
entry.submit          { zh: '保存记录', en: 'Save Entry' }
entry.cancel          { zh: '跳过', en: 'Skip' }
entry.minutes         { zh: '分钟', en: 'min' }
```

## Self-Review Checklist

- [x] No TBDs or TODOs — all fields, components, and translations specified
- [x] Internal consistency — data model matches form fields matches card display
- [x] Scope check — single module, no decomposition needed
- [x] Ambiguity check — rating range (1-5), photo format (Base64), tags (free + suggestions) all explicit
- [x] Backward compatibility — existing cook signal preserved, new metadata is optional
- [x] Integration points mapped — FocusMode, PreferenceEngine, RecipeList, App.tsx
