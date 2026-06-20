# Meal Planner — Design Spec

**Date:** 2026-06-20
**Status:** approved
**Depends on:** M1-M2 modules, CartSheet, Cooking Journal

## Overview

Add a Meal Planner module that lets users create named meal plans with flexible days and named slots, populate slots with recipes from the database and from within recipe detail. A single button generates a merged shopping list for the entire plan.

## Data Model

```typescript
interface MealSlot {
  id: string              // crypto.randomUUID()
  name: string            // "早餐", "午餐", "晚餐", or custom
  recipeId: string | null // null = empty slot
}

interface MealDay {
  id: string
  label: string           // "周一", "Day 1", or custom
  slots: MealSlot[]
}

interface MealPlan {
  id: string              // crypto.randomUUID()
  name: string            // "本周备餐", "聚会菜单"
  createdAt: number       // Unix ms
  days: MealDay[]
}
```

### Quick-Start Presets

| Preset | Days | Slots per day |
|--------|------|---------------|
| 一周备餐 | 7 (周一~日) | 午餐, 晚餐 |
| 三日精简 | 3 (Day 1-3) | 早餐, 午餐, 晚餐 |
| 空白 | 0 | — |

### Persistence

- localStorage key: `cooking-lab:mealPlans`
- Type: `MealPlan[]`
- Reuses existing `useStoredState` pattern

## UI Architecture

### Entry Point

- **5th top-level tab** "计划" after 食材搜菜
- Tab order: 发现 → 浏览 → 日志 → 食材搜菜 → 计划

### Views

#### 1. Plan List (MealPlanner)

- Header with "📋 餐食计划" + "新建" button
- Card per plan showing: name, date range, day count, inline day preview with slot names
- "生成采购清单" button per plan → merges all recipe ingredients → adds to cart
- Swipe-left to delete plan

#### 2. Plan Detail (PlanDetail)

- Header: back ←, plan name, "+添加菜谱" button
- "+ 添加天" button at top
- Per-day card:
  - Day label (editable tap)
  - Slots listed: slot name · recipe name [× remove] [swap search]
  - Empty slot: click to open recipe picker
  - "+ 添加餐次" button per day
- Bottom: "生成采购清单" button
- "删除计划" at bottom (secondary)

#### 3. Recipe Picker (for slot fill)

- Search input + filtered recipe list
- Tap recipe → fills the slot, closes picker
- Reuses RecipeCard in compact mode

#### 4. "Add to Plan" from Recipe Detail

- In recipe detail page: "加入计划" button
- Opens a mini modal: pick target plan → pick day → pick slot → confirm
- Or: quick-add to most recent plan

### Integration Points

| Integration | How |
|-------------|-----|
| CartSheet | "生成采购清单" merges all recipe ingredients across plan, calls CartSheet add logic |
| Recipe Detail | "加入计划" button in detail header or actions area |
| Recipe Database | Slot fill uses RECIPES for lookup |
| Preference Engine | Plan choices logged as 'plan' action type (future enhancement) |
| Cooking Journal | Cooking a planned meal auto-links to journal entry |

### Component Structure

```
New files:
  src/hooks/useMealPlanner.ts        # CRUD for MealPlan[]
  src/components/MealPlanner.tsx     # Plan list view
  src/components/PlanDetail.tsx      # Single plan editor
  src/components/RecipePicker.tsx    # Recipe search & select modal

Modified files:
  src/App.tsx                        # 5th tab type, plan selection state
  src/components/RecipeList.tsx      # 5th tab in TABS
  src/data/types.ts                  # MealPlan, MealDay, MealSlot interfaces
  src/i18n/translations.ts           # New keys
```

## Translation Keys Needed

```
tab.planner                { zh: '计划', en: 'Plans' }
planner.newPlan            { zh: '+ 新建', en: '+ New' }
planner.empty              { zh: '还没有餐食计划', en: 'No meal plans yet' }
planner.emptyHint          { zh: '创建一个计划来安排本周菜单', en: 'Create a plan to organize your meals' }
planner.newPlanPrompt      { zh: '计划名称', en: 'Plan Name' }
planner.generateList       { zh: '生成采购清单', en: 'Generate Shopping List' }
planner.delete             { zh: '删除', en: 'Delete' }
planner.deleteConfirm      { zh: '确定删除这个计划？', en: 'Delete this plan?' }
planner.presetWeek         { zh: '一周备餐', en: 'Weekly Plan' }
planner.preset3Day         { zh: '三日精简', en: '3-Day Plan' }
planner.presetBlank        { zh: '空白开始', en: 'From Scratch' }
planner.addDay             { zh: '+ 添加天', en: '+ Add Day' }
planner.addSlot            { zh: '+ 添加餐次', en: '+ Add Meal' }
planner.addRecipe          { zh: '+ 添加菜谱', en: '+ Add Recipe' }
planner.addToPlan          { zh: '加入计划', en: 'Add to Plan' }
planner.selectSlot         { zh: '选择餐次', en: 'Select Meal Slot' }
planner.emptySlot          { zh: '空', en: 'Empty' }
planner.defaultSlotNames   { zh: ['早餐','午餐','晚餐'], en: ['Breakfast','Lunch','Dinner'] }
plan.listGenerated         { zh: '已生成采购清单', en: 'Shopping list generated' }
```

## Self-Review

- [x] Data model complete with presets
- [x] UI architecture covers list + detail + picker + recipe-detail entry
- [x] Integration points mapped (CartSheet, Recipe DB, Preference, Journal)
- [x] Component boundaries clear (4 new, 4 modified)
- [x] All translation keys listed
- [x] No TBDs or TODOs
