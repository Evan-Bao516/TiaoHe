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
