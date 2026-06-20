import { useCallback, useMemo } from 'react'
import type { MealPlan } from '../data/types'
import { useStoredState } from './useStoredState'

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

  return useMemo(() => ({ plans, createPlan, deletePlan, updatePlan, getPlan }), [plans, createPlan, deletePlan, updatePlan, getPlan])
}
