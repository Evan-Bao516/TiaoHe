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
