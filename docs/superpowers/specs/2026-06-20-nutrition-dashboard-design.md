# Nutrition Dashboard — Design Spec

**Date:** 2026-06-20
**Status:** approved
**Depends on:** Cooking Journal, Recipe Database

## Overview

Add a Nutrition Dashboard that aggregates nutrition data from the Cooking Journal and Recipe database. Shows calories, macros, trends, and distributions over a custom date range. Uses custom SVG visualizations matching the existing AlchemistCore style.

## Data Model

```typescript
interface NutritionStats {
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

All computed from `CookEntry[]` + `Recipe` lookup — no new persistent state.

## UI Architecture

### Entry Point
- **6th top-level tab** "营养" after 计划
- Tab order: 发现 → 浏览 → 日志 → 食材搜菜 → 计划 → 营养

### Views

#### Standard View (default)
- Date range picker (start → end date)
- Hero stat: total kcal (large number) + avg kcal/day
- SVG line chart: daily kcal trend (AlchemistCore dark theme: cyan line on dark grid)
- SVG bar chart: macros (protein green / fats amber / carbs cyan)
- 3 stat cards: cook count, avg rating, total hours

#### Detail View (toggle expand)
- SVG donut chart: cuisine distribution (reuse AlchemistCore pattern)
- Horizontal bar list: custom tag distribution
- Top 5 most-cooked recipes list

## Component Structure

```
New files:
  src/hooks/useNutritionStats.ts         # Aggregation engine
  src/components/NutritionDashboard.tsx  # Main view
  src/components/NutritionCharts.tsx     # SVG charts (line, bar, donut)

Modified files:
  src/App.tsx                            # 6th tab type
  src/components/RecipeList.tsx          # 6th tab in TABS
  src/i18n/translations.ts               # New keys
```

## Integration
- `useCookJournal().allEntries` → raw data
- RECIPES lookup for macros/kcal per recipe
- Date range filter
- Opt-in via tab (no auto-tracking)

## Translation Keys
```
tab.nutrition             { zh: '营养', en: 'Nutrition' }
nutri.dateRange           { zh: '日期范围', en: 'Date Range' }
nutri.from                { zh: '从', en: 'From' }
nutri.to                  { zh: '至', en: 'To' }
nutri.totalKcal           { zh: '总热量', en: 'Total Kcal' }
nutri.avgKcal             { zh: '日均热量', en: 'Avg Kcal/Day' }
nutri.cookCount           { zh: '烹饪次数', en: 'Cooks' }
nutri.avgRating           { zh: '平均评分', en: 'Avg Rating' }
nutri.totalHours          { zh: '总耗时', en: 'Total Hours' }
nutri.protein             { zh: '蛋白质', en: 'Protein' }
nutri.fats                { zh: '脂肪', en: 'Fats' }
nutri.carbs               { zh: '碳水', en: 'Carbs' }
nutri.cuisineDistribution { zh: '菜系分布', en: 'Cuisine Distribution' }
nutri.tagDistribution     { zh: '标签分布', en: 'Tag Distribution' }
nutri.topRecipes          { zh: '常用菜谱', en: 'Top Recipes' }
nutri.showDetails         { zh: '查看详情', en: 'Show Details' }
nutri.hideDetails         { zh: '收起详情', en: 'Hide Details' }
nutri.noData              { zh: '暂无烹饪数据', en: 'No cooking data yet' }
nutri.noDataHint          { zh: '开始烹饪记录后查看营养数据', en: 'Start cooking and logging to see nutrition data' }
```
