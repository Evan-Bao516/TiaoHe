import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale } from './translations'
import { T } from './translations'

interface LangCtx {
  lang: Locale
  toggleLang: () => void
  t: (key: string) => string
}

const LangContext = createContext<LangCtx>({ lang: 'zh', toggleLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>(() => {
    try { return (localStorage.getItem('cooking-lab:lang') as Locale) ?? 'zh' }
    catch { return 'zh' }
  })

  const t = useCallback((key: string): string => {
    return T[key]?.[lang] ?? key
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Locale = prev === 'zh' ? 'en' : 'zh'
      localStorage.setItem('cooking-lab:lang', next)
      return next
    })
  }, [])

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
