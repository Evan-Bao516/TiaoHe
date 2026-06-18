import { useState, useEffect } from 'react'

/** Like useState but persists to localStorage under `key`.
 *  Handles JSON serialization.  Returns [value, setter, ready]. */
export function useStoredState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [ready, setReady] = useState(false)
  const [value, setValue] = useState<T>(initial)

  /* Hydrate on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`cooking-lab:${key}`)
      if (raw) setValue(JSON.parse(raw))
    } catch { /* use initial */ }
    setReady(true)
  }, [key])

  /* Persist on change (skip initial render before hydration) */
  useEffect(() => {
    if (!ready) return
    localStorage.setItem(`cooking-lab:${key}`, JSON.stringify(value))
  }, [key, value, ready])

  return [value, setValue, ready]
}
