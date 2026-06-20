import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Search, Flame, ChefHat, Sparkles, BookOpen, Grid3X3, ShoppingCart, Shuffle, Clock, CheckCircle2, Heart, ArrowUp, SlidersHorizontal, ChevronDown, Languages, Timer } from 'lucide-react'
import type { Recipe, Category } from '../data/types'
import { RECIPES } from '../data/recipes'
import RecipeCard from './RecipeCard'
import PreferenceBar from './PreferenceBar'
import { useStoredState } from '../hooks/useStoredState'
import { useLang } from '../i18n/context'
import FridgeIcon from './FridgeIcon'
import CookJournal from './CookJournal'

interface RecipeListProps {
  cartCount: number
  inventory: Set<string>
  recentIds: string[]
  favoriteIds: Set<string>
  recipeScores: Map<string, number>
  activeTab: 'discover' | 'browse' | 'journal'
  onTabChange: (tab: 'discover' | 'browse' | 'journal') => void
  drinkSub: 'all' | 'alcoholic' | 'nonalcoholic'
  onDrinkSubChange: (sub: 'all' | 'alcoholic' | 'nonalcoholic') => void
  browseSub: Category | 'all'
  onBrowseSubChange: (sub: Category | 'all') => void
  onSelect: (recipe: Recipe) => void
  onOpenCart: () => void
  onOpenInventory: () => void
  onOpenTimer: () => void
  onQuickAddMissing: (recipe: Recipe) => void
  onToggleRecipeFavorite: (id: string) => void
  preferenceTags: string[]
  onResetPreferences: () => void
}

const TABS: { key: 'discover' | 'browse' | 'journal'; icon: typeof Flame }[] = [
  { key: 'discover', icon: Sparkles },
  { key: 'browse', icon: Grid3X3 },
  { key: 'journal', icon: BookOpen },
]

const BROWSE_SUBS: { key: Category | 'all'; icon: typeof Flame }[] = [
  { key: 'all', icon: Grid3X3 },
  { key: 'chinese', icon: Flame },
  { key: 'western', icon: ChefHat },
  { key: 'drink', icon: Sparkles },
  { key: 'basic', icon: BookOpen },
]

const SCENES: { key: string; color: string; filter: (r: Recipe) => boolean }[] = [
  { key: 'light', color: '#10B981', filter: (r) => r.tags.some((t) => ['高蛋白', '沙拉', '快手'].includes(t)) && r.totalKcal < 400 },
  { key: 'party', color: '#FF9F0A', filter: (r) => ['chinese', 'drink'].includes(r.category) && r.difficulty !== 'hard' },
  { key: 'beginner', color: '#00E5FF', filter: (r) => r.difficulty === 'easy' && r.category !== 'basic' },
  { key: 'drinks', color: '#FF2E93', filter: (r) => r.category === 'drink' },
]

export default function RecipeList({ cartCount, inventory, recentIds, favoriteIds, recipeScores, activeTab, onTabChange, drinkSub, onDrinkSubChange, browseSub, onBrowseSubChange, onSelect, onOpenCart, onOpenInventory, onOpenTimer, onQuickAddMissing, onToggleRecipeFavorite, preferenceTags, onResetPreferences }: RecipeListProps) {
  const [query, setQuery] = useState('')
  const [showMakeable, setShowMakeable] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'fast' | 'medium' | 'long'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefCuisine, setPrefCuisine] = useState<'all' | 'chinese' | 'western' | 'drink'>('all')
  const [prefSpice, setPrefSpice] = useState<'all' | 'spicy' | 'mild' | 'nospicy'>('all')
  const [prefTime, setPrefTime] = useState<'all' | 'fast' | 'medium' | 'long'>('all')
  const [prefType, setPrefType] = useState<'all' | 'food' | 'drink'>('all')
  const [showFab, setShowFab] = useState(false)
  const [sortMode, setSortMode] = useState<'preference' | 'alphabetical'>('preference')
  const [searchHistory, setSearchHistory] = useStoredState<string[]>('searchHistory', [])
  const [searchFocused, setSearchFocused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = useCallback((recipe: Recipe) => {
    /* Save scroll position before navigating */
    if (scrollRef.current) {
      sessionStorage.setItem('cooking-lab:scrollTop', String(scrollRef.current.scrollTop))
    }
    onSelect(recipe)
  }, [onSelect])

  /* Restore scroll position on mount */
  useEffect(() => {
    const saved = sessionStorage.getItem('cooking-lab:scrollTop')
    if (saved && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = Number(saved)
      })
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setShowFab(el.scrollTop > 400)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const { lang, toggleLang, t } = useLang()
  /* Check if a recipe can be made with inventory (accounting for substitutions) */
  const canMake = useMemo(() => {
    const set = new Set<string>()
    for (const r of RECIPES) {
      let ok = true
      for (const ing of r.ingredients) {
        if (inventory.has(ing.nameZh)) continue
        if (ing.substitution && inventory.has(ing.substitution.nameZh)) continue
        ok = false; break
      }
      if (ok) set.add(r.id)
    }
    return set
  }, [inventory])

  const filtered = useMemo(() => {
    let list = RECIPES
    if (activeTab === 'browse' && browseSub !== 'all') list = list.filter((r) => r.category === browseSub)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((r) =>
        r.nameZh.includes(q) || r.nameEn.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.ingredients.some((i) => i.nameZh.includes(q) || i.nameEn.toLowerCase().includes(q)),
      )
    }
    if (showMakeable && inventory.size > 0) list = list.filter((r) => canMake.has(r.id))
    if (showFavorites) list = list.filter((r) => favoriteIds.has(r.id))
    if (activeTab === 'browse' && browseSub === 'drink' && drinkSub === 'alcoholic') list = list.filter((r) => r.tags.includes('含酒精'))
    if (activeTab === 'browse' && browseSub === 'drink' && drinkSub === 'nonalcoholic') list = list.filter((r) => r.tags.includes('无酒精'))
    if (difficultyFilter !== 'all') list = list.filter((r) => r.difficulty === difficultyFilter)
    if (timeFilter === 'fast') list = list.filter((r) => parseInt(r.prepTime) <= 15)
    if (timeFilter === 'medium') list = list.filter((r) => { const t = parseInt(r.prepTime); return t > 15 && t <= 30 })
    if (timeFilter === 'long') list = list.filter((r) => parseInt(r.prepTime) > 30)
    // Sort: preference by default (with A-Z tiebreaker), alphabetical on toggle
    if (sortMode === 'alphabetical') {
      list = [...list].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
    } else if (recipeScores.size > 0) {
      list = [...list].sort((a, b) => {
        const diff = (recipeScores.get(b.id) ?? 0.5) - (recipeScores.get(a.id) ?? 0.5)
        if (diff !== 0) return diff
        return a.nameZh.localeCompare(b.nameZh, 'zh')
      })
    } else {
      list = [...list].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
    }
    return list
  }, [activeTab, browseSub, query, showMakeable, canMake, inventory, showFavorites, favoriteIds, drinkSub, difficultyFilter, timeFilter, sortMode, recipeScores])

  /* Recently viewed */
  const recentRecipes = useMemo(
    () => recentIds.map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean) as Recipe[],
    [recentIds],
  )

  /* Preference-matched recipes */
  const prefMatches = useMemo(() => {
    let list = RECIPES
    if (prefCuisine !== 'all') {
      if (prefCuisine === 'drink') list = list.filter((r) => r.category === 'drink')
      else list = list.filter((r) => r.category === prefCuisine)
    }
    if (prefSpice === 'spicy') list = list.filter((r) => r.flavorProfile.spicy > 0.5)
    if (prefSpice === 'mild') list = list.filter((r) => r.flavorProfile.spicy > 0.1 && r.flavorProfile.spicy <= 0.5)
    if (prefSpice === 'nospicy') list = list.filter((r) => r.flavorProfile.spicy <= 0.1)
    if (prefTime === 'fast') list = list.filter((r) => parseInt(r.prepTime) <= 15)
    if (prefTime === 'medium') list = list.filter((r) => { const t = parseInt(r.prepTime); return t > 15 && t <= 30 })
    if (prefTime === 'long') list = list.filter((r) => parseInt(r.prepTime) > 30)
    if (prefType === 'food') list = list.filter((r) => r.category !== 'drink')
    if (prefType === 'drink') list = list.filter((r) => r.category === 'drink')
    return list
  }, [prefCuisine, prefSpice, prefTime, prefType])
  const hasPrefs = prefCuisine !== 'all' || prefSpice !== 'all' || prefTime !== 'all' || prefType !== 'all'

  /* Suggested recipes (scored + exploration) */
  const suggestedItems = useMemo(() => {
    const seen = new Set(recentIds)
    // All recipes sorted by score, excluding viewed
    const scored = RECIPES
      .filter((r) => !seen.has(r.id))
      .map((r) => ({ recipe: r, score: recipeScores.get(r.id) ?? 0.5 }))
      .sort((a, b) => b.score - a.score)

    // High-score pool and exploration pool
    const highScore = scored.filter((s) => s.score >= 0.5)
    const explore = scored.filter((s) => s.score < 0.5)

    // Shuffle exploration pool
    for (let i = explore.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [explore[i], explore[j]] = [explore[j], explore[i]]
    }

    // Build: 3 high-score + 2 exploration
    const items: { recipe: Recipe; label: string }[] = []
    highScore.slice(0, 3).forEach((s) => items.push({ recipe: s.recipe, label: '' }))
    explore.slice(0, 2).forEach((s) => items.push({
      recipe: s.recipe,
      label: t('pref.explore'),
    }))

    // Fill remaining with high-score if exploration pool insufficient
    if (items.length < 5) {
      const used = new Set(items.map((i) => i.recipe.id))
      for (const s of scored) {
        if (items.length >= 5) break
        if (!used.has(s.recipe.id)) {
          items.push({ recipe: s.recipe, label: '' })
        }
      }
    }

    return items.slice(0, 5)
  }, [lang, recentIds, RECIPES, recipeScores])

  /* Blind box roll */
  const handleBlindBox = () => {
    const candidates = prefMatches.length > 0 ? prefMatches : RECIPES
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    handleSelect(pick)
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0A0E17' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3">
          {/* App icon */}
          <img src="/icon-v2.png" alt="TiaoHe" className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex items-baseline gap-3">
            <h1 className="text-[24px] tracking-[0.04em] text-text-primary leading-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{t('app.title')}</h1>
            <span className="text-[11px] tracking-[0.06em] uppercase text-text-dim"
              style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{t('app.subtitle')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {/* Language toggle */}
          <button onClick={toggleLang}
            className="flex items-center justify-center w-10 h-10 rounded-md text-text-muted hover:text-ice-400 transition-colors duration-200"
            aria-label="Toggle language">
            <Languages size={20} strokeWidth={1.5} />
          </button>
          {/* Favorites filter */}
          <button onClick={() => { setShowFavorites((v) => !v); setShowMakeable(false) }}
            className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200
              ${showFavorites ? 'text-[#FF2E93]' : 'text-text-muted hover:text-[#FF2E93]'}`}
            aria-label={showFavorites ? 'Show all' : 'Show favorites'}>
            <Heart size={20} strokeWidth={1.5} fill={showFavorites ? '#FF2E93' : 'none'} />
          </button>
          <button onClick={onOpenTimer}
            className="relative flex items-center justify-center w-10 h-10 rounded-md text-text-muted hover:text-ice-400 transition-colors duration-200">
            <Timer size={20} strokeWidth={1.5} />
          </button>
          <button onClick={onOpenInventory}
            className="relative flex items-center justify-center w-10 h-10 rounded-md text-text-muted hover:text-emerald-400 transition-colors duration-200">
            <FridgeIcon size={20} />
          </button>
          <button onClick={onOpenCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-md text-text-muted hover:text-ice-400 transition-colors duration-200"
            aria-label={`Shopping cart, ${cartCount} items`}>
            <ShoppingCart size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 animate-in"
                style={{ fontFamily: 'var(--font-mono)', background: '#00E5FF', color: '#0A0E17', boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="px-4 pb-3 relative">
        <div className="flex items-center gap-3 px-4 py-3 rounded-md"
          style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
          <Search size={16} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
          <input ref={searchInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                setSearchHistory((prev) => {
                  const next = [query.trim(), ...prev.filter((s) => s !== query.trim())].slice(0, 8)
                  return next
                })
              }
            }}
            placeholder={t('search.placeholder')} className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-dim outline-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-dim hover:text-text-primary transition-colors text-[11px]"
              style={{ fontFamily: 'var(--font-mono)' }}>ESC</button>
          )}
        </div>

        {/* Search history / suggestions dropdown */}
        {searchFocused && !query && searchHistory.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 z-30 rounded-md overflow-hidden"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-[9px] tracking-[0.1em] uppercase text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>{t('search.history')}</span>
              <button onClick={() => setSearchHistory([])} className="text-[9px] text-text-dim hover:text-text-primary"
                style={{ fontFamily: 'var(--font-mono)' }}>{t('search.clear')}</button>
            </div>
            {searchHistory.map((term, i) => (
              <button key={i} onClick={() => { setQuery(term); searchInputRef.current?.focus() }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-text-muted hover:bg-charcoal-800/50 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-body)' }}>
                <Search size={11} strokeWidth={1.5} className="text-text-dim" />{term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Preference Picker ─────────────────────────────────── */}
      <div className="px-4 pb-3">
        <button onClick={() => setShowPrefs((v) => !v)}
          className="w-full py-3 rounded-md text-[14px] tracking-[0.06em] font-semibold transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2"
          style={{
            fontFamily: 'var(--font-display)', color: '#F4F4F4',
            background: showPrefs || hasPrefs
              ? 'linear-gradient(105deg, rgba(0, 229, 255, 0.12), rgba(255, 46, 147, 0.08))'
              : 'linear-gradient(105deg, rgba(255, 46, 147, 0.1), rgba(0, 229, 255, 0.1))',
            border: showPrefs || hasPrefs ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid rgba(255, 46, 147, 0.2)',
            boxShadow: showPrefs || hasPrefs ? '0 0 20px rgba(0, 229, 255, 0.1)' : '0 0 20px rgba(255, 46, 147, 0.06)',
          }}>
          <Shuffle size={16} strokeWidth={1.5} />
          {hasPrefs ? `${prefMatches.length} ${t('pref.matchCount')} · ${t('pref.random')}` : t('blindbox.button')}
          <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform ${showPrefs ? 'rotate-180' : ''}`} />
        </button>

        {!showPrefs && !hasPrefs && recipeScores.size > 0 && (
          <p className="mt-1.5 text-[10px] text-text-dim"
            style={{ fontFamily: 'var(--font-body)', opacity: 0.6 }}>
            💡 {t('pref.autoHint')}
          </p>
        )}

        {showPrefs && (
          <div className="mt-2 p-4 rounded-md animate-in"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.cuisine')}</span>
              {(['all', 'chinese', 'western', 'drink'] as const).map((k) => (
                <button key={k} onClick={() => setPrefCuisine(k)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: prefCuisine === k ? '#F4F4F4' : '#5A6272',
                    background: prefCuisine === k ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                    border: prefCuisine === k ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                  }}>{k === 'all' ? t('pref.all') : k === 'chinese' ? t('pref.chinese') : k === 'western' ? t('pref.western') : t('pref.drink')}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.spice')}</span>
              {(['all', 'spicy', 'mild', 'nospicy'] as const).map((k) => (
                <button key={k} onClick={() => setPrefSpice(k)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: prefSpice === k ? '#F4F4F4' : '#5A6272',
                    background: prefSpice === k ? 'rgba(255, 159, 10, 0.1)' : 'transparent',
                    border: prefSpice === k ? '1px solid rgba(255, 159, 10, 0.25)' : '1px solid transparent',
                  }}>{k === 'all' ? t('pref.all') : k === 'spicy' ? t('pref.spicy') : k === 'mild' ? t('pref.mild') : t('pref.nospicy')}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.time')}</span>
              {(['all', 'fast', 'medium', 'long'] as const).map((k) => (
                <button key={k} onClick={() => setPrefTime(k)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: prefTime === k ? '#F4F4F4' : '#5A6272',
                    background: prefTime === k ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    border: prefTime === k ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                  }}>{k === 'all' ? t('pref.all') : k === 'fast' ? '≤15min' : k === 'medium' ? '15-30' : '>30min'}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.type')}</span>
              {(['all', 'food', 'drink'] as const).map((k) => (
                <button key={k} onClick={() => setPrefType(k)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: prefType === k ? '#F4F4F4' : '#5A6272',
                    background: prefType === k ? 'rgba(255, 46, 147, 0.1)' : 'transparent',
                    border: prefType === k ? '1px solid rgba(255, 46, 147, 0.25)' : '1px solid transparent',
                  }}>{k === 'all' ? t('pref.all') : k === 'food' ? t('pref.food') : t('pref.drinkType')}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPrefCuisine('all'); setPrefSpice('all'); setPrefTime('all'); setPrefType('all') }}
                className="text-[10px] text-text-dim hover:text-text-primary" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.reset')}</button>
              <button onClick={handleBlindBox}
                className="flex-1 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1"
                style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                <Shuffle size={12} />{t('pref.random')}
              </button>
            </div>
            {hasPrefs && prefMatches.length > 0 && (
              <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(0, 229, 255, 0.06)' }}>
                {prefMatches.slice(0, 4).map((r) => (
                  <button key={r.id} onClick={() => handleSelect(r)}
                    className="text-left px-3 py-2 rounded flex-shrink-0 hover:bg-charcoal-800/50"
                    style={{ background: '#0D111A', border: '1px solid rgba(0, 229, 255, 0.04)' }}>
                    <span className="text-[12px] text-text-primary block" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {r.emoji} {lang === 'en' ? r.nameEn : r.nameZh}</span>
                  </button>
                ))}
              </div>
            )}
            {hasPrefs && prefMatches.length === 0 && (
              <div className="mt-3 pt-3 text-center" style={{ borderTop: '1px solid rgba(0, 229, 255, 0.06)' }}>
                <span className="text-[11px] text-text-dim">{t('pref.noMatch')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Top-level tabs: 发现 / 浏览 ────────────────────────── */}
      <div className="px-4 pb-2 flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => onTabChange(tab.key)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] tracking-[0.04em] transition-all duration-200 flex-shrink-0 whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-mono)', color: isActive ? '#00E5FF' : '#5A6272',
                background: isActive ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid transparent',
              }}>
              <Icon size={12} strokeWidth={1.5} />{t(`tab.${tab.key}`)}
            </button>
          )
        })}
      </div>

      {/* ── 浏览 sub-tabs ──────────────────────────────────────── */}
      {activeTab === 'browse' && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {BROWSE_SUBS.map((sub) => {
            const isActive = browseSub === sub.key
            const Icon = sub.icon
            return (
              <button key={sub.key} onClick={() => { onBrowseSubChange(sub.key); onDrinkSubChange('all') }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] tracking-[0.04em] transition-all duration-200"
                style={{
                  fontFamily: 'var(--font-mono)', color: isActive ? '#F4F4F4' : '#5A6272',
                  background: isActive ? 'rgba(255, 159, 10, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 159, 10, 0.2)' : '1px solid transparent',
                }}>
                <Icon size={10} strokeWidth={1.5} />{t(`tab.${sub.key}`)}
              </button>
            )
          })}
        </div>
      )}

      {/* Quick filter toggle + panel */}
      <div className="px-4 pb-2">
        <button onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] tracking-[0.06em] transition-all duration-200`}
          style={{
            fontFamily: 'var(--font-mono)',
            color: showFilters || difficultyFilter !== 'all' || timeFilter !== 'all' ? '#00E5FF' : '#5A6272',
            background: showFilters ? 'rgba(0, 229, 255, 0.04)' : 'transparent',
            border: showFilters ? '1px solid rgba(0, 229, 255, 0.15)' : '1px solid rgba(138, 148, 166, 0.06)',
          }}>
          <SlidersHorizontal size={12} strokeWidth={1.5} />
          {t('filter.quick')}
          {(difficultyFilter !== 'all' || timeFilter !== 'all') && (
            <span className="min-w-[16px] h-[16px] rounded-full text-[9px] flex items-center justify-center"
              style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF' }}>
              {(difficultyFilter !== 'all' ? 1 : 0) + (timeFilter !== 'all' ? 1 : 0)}
            </span>
          )}
          <ChevronDown size={12} strokeWidth={1.5}
            className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-2 p-3 rounded-md animate-in"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
            {/* Difficulty */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-[0.08em] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('filter.difficulty')}</span>
              {(['all', 'easy', 'medium', 'hard'] as const).map((key) => {
                const isActive = difficultyFilter === key
                const label = key === 'all' ? t('drink.subAll') : key === 'easy' ? t('diff.easy') : key === 'medium' ? t('diff.medium') : t('diff.hard')
                return (
                  <button key={key} onClick={() => setDifficultyFilter(key)}
                    className={`px-2.5 py-1 rounded text-[10px] transition-all duration-200`}
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: isActive ? '#F4F4F4' : '#5A6272',
                      background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                    }}>{label}</button>
                )
              })}
            </div>
            {/* Time */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.08em] text-text-dim flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{t('pref.time')}</span>
              {(['all', 'fast', 'medium', 'long'] as const).map((key) => {
                const isActive = timeFilter === key
                const label = key === 'all' ? t('drink.subAll') : key === 'fast' ? `≤15min` : key === 'medium' ? `15-30min` : `>30min`
                return (
                  <button key={key} onClick={() => setTimeFilter(key)}
                    className={`px-2.5 py-1 rounded text-[10px] transition-all duration-200`}
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: isActive ? '#F4F4F4' : '#5A6272',
                      background: isActive ? 'rgba(255, 159, 10, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(255, 159, 10, 0.25)' : '1px solid transparent',
                    }}>{label}</button>
                )
              })}
            </div>
            {(difficultyFilter !== 'all' || timeFilter !== 'all') && (
              <button onClick={() => { setDifficultyFilter('all'); setTimeFilter('all') }}
                className="mt-2 text-[10px] text-text-dim hover:text-text-primary"
                style={{ fontFamily: 'var(--font-mono)' }}>{t('filter.clearAll')}</button>
            )}
          </div>
        )}
      </div>

      {/* Drink sub-tabs */}
      {activeTab === 'browse' && browseSub === 'drink' && (
        <div className="px-4 pb-3 flex gap-2">
          {(['all', 'alcoholic', 'nonalcoholic'] as const).map((key) => {
            const isActive = drinkSub === key
            const label = key === 'all' ? t('drink.subAll') : key === 'alcoholic' ? t('drink.subAlcoholic') : t('drink.subNonalcoholic')
            return (
              <button key={key} onClick={() => onDrinkSubChange(key)}
                className={`px-3 py-1.5 rounded-md text-[11px] tracking-[0.06em] transition-all duration-200`}
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? '#FF2E93' : '#5A6272',
                  background: isActive ? 'rgba(255, 46, 147, 0.06)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 46, 147, 0.2)' : '1px solid rgba(138, 148, 166, 0.06)',
                }}>
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Makeable filter toggle */}
      {activeTab === 'browse' && inventory.size > 0 && (
        <div className="px-4 pb-3">
          <button onClick={() => setShowMakeable((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] tracking-[0.06em] transition-all duration-200`}
            style={{
              fontFamily: 'var(--font-mono)',
              color: showMakeable ? '#10B981' : '#5A6272',
              background: showMakeable ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
              border: showMakeable ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(138, 148, 166, 0.08)',
            }}>
            <CheckCircle2 size={12} strokeWidth={1.5} />
            {t('filter.makeable')} ({RECIPES.filter((r) => canMake.has(r.id) && (browseSub === 'all' || r.category === browseSub)).length})
          </button>
        </div>
      )}

      {/* ── Scrollable content ────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-8">

        {/* ── Favorites banner ──────────────────────────────── */}
        {showFavorites && (
          <div className="mb-4 px-3 py-2 rounded-md flex items-center justify-between"
            style={{ background: 'rgba(255, 46, 147, 0.04)', border: '1px solid rgba(255, 46, 147, 0.1)' }}>
            <span className="text-[11px] tracking-[0.06em] flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-mono)', color: '#FF2E93' }}>
              <Heart size={12} strokeWidth={1.5} fill="#FF2E93" /> {t('home.favorites')} · {filtered.length}
            </span>
            <button onClick={() => setShowFavorites(false)}
              className="text-[10px] text-text-dim hover:text-text-primary"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('status.clearFilter')}</button>
          </div>
        )}

        {/* ── 发现 tab: curated content ──────────────────────── */}
        {activeTab === 'discover' && !query && !showFavorites && (
          <>
            {/* Preference tags bar */}
            <PreferenceBar tags={preferenceTags} onReset={onResetPreferences} />

            {/* Scene packs */}
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.15em] uppercase text-text-dim"
                  style={{ fontFamily: 'var(--font-mono)' }}>{t('home.scenes')}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(0, 229, 255, 0.06)' }} />
              </div>
              {SCENES.map((scene) => {
                const recipes = RECIPES.filter(scene.filter).slice(0, 3)
                if (recipes.length === 0) return null
                return (
                  <div key={scene.key}>
                    <div className="flex items-center gap-2 mb-2">
                      <div style={{ width: 3, height: 14, background: scene.color, borderRadius: 1, opacity: 0.5 }} />
                      <span className="text-[12px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{t(`scene.${scene.key}`)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {recipes.map((r) => (
                        <button key={r.id} onClick={() => handleSelect(r)}
                          className="text-left p-2.5 rounded-md transition-all duration-200 hover:bg-charcoal-800/50"
                          style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.04)' }}>
                          <span className="text-[12px] text-text-primary block leading-tight mb-1"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{r.emoji} {lang==='en' ? r.nameEn : r.nameZh}</span>
                          <span className="text-[9px] text-text-dim flex items-center gap-1">
                            <Clock size={9} strokeWidth={1} />{r.prepTime}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty discover state */}
            {recentRecipes.length === 0 && (
              <div className="mb-5 flex flex-col items-center justify-center py-12 rounded-lg"
                style={{ background: 'rgba(0, 229, 255, 0.02)', border: '1px solid rgba(0, 229, 255, 0.04)' }}>
                <Sparkles size={24} strokeWidth={1} className="text-text-dim mb-3 opacity-30" />
                <p className="text-[13px] text-text-muted" style={{ fontFamily: 'var(--font-display)' }}>{t('home.emptyDiscover')}</p>
                <p className="text-[11px] text-text-dim mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('home.emptyDiscoverHint')}</p>
              </div>
            )}

            {/* Merged: 为你推荐 (scored by preference engine + exploration) */}
            {recentRecipes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={11} strokeWidth={1.5} className="text-amber-500" />
                  <span className="text-[10px] tracking-[0.15em] uppercase text-text-dim"
                    style={{ fontFamily: 'var(--font-mono)' }}>{t('home.suggested')}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 159, 10, 0.06)' }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {suggestedItems.map(({ recipe, label }) => (
                    <button key={recipe.id} onClick={() => handleSelect(recipe)}
                      className="text-left px-3 py-2 rounded-md transition-all duration-200 hover:bg-charcoal-800/50"
                      style={{ background: '#121620', border: `1px solid ${label ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 229, 255, 0.04)'}` }}>
                      <span className="text-[12px] text-text-primary block"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{recipe.emoji} {lang === 'en' ? recipe.nameEn : recipe.nameZh}</span>
                      {label && (
                        <span className="text-[9px]" style={{ fontFamily: 'var(--font-body)', color: '#10B981' }}>{label}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </>
        )}

        {/* ── Journal tab ──────────────────────────────────── */}
        {activeTab === 'journal' && !query && !showFavorites && (
          <CookJournal />
        )}

        {/* ── Browse / filtered view ──────────────────────────── */}
        {(activeTab === 'browse' || query || showFavorites) && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-[0.15em] uppercase text-text-dim"
                style={{ fontFamily: 'var(--font-mono)' }}>
                {showFavorites ? t('status.myFav') : query ? t('search.results') : activeTab === 'browse' && browseSub !== 'all' ? t(`tab.${browseSub}`) : t('home.browseAll')}
              </span>
              <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>({filtered.length})</span>
              <div className="flex-1" />
              <button onClick={() => setSortMode((m) => m === 'preference' ? 'alphabetical' : 'preference')}
                className="text-[9px] tracking-[0.06em] px-2 py-0.5 rounded transition-colors duration-200"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: sortMode === 'preference' ? '#00E5FF' : '#5A6272',
                  background: sortMode === 'preference' ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
                  border: sortMode === 'preference' ? '1px solid rgba(0, 229, 255, 0.15)' : '1px solid transparent',
                }}>
                ▸ {sortMode === 'preference' ? t('pref.sortPreference') : t('pref.sortAlpha')}
              </button>
            </div>

            {filtered.length === 0 ? (
              showFavorites ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-dim">
                  <Heart size={32} strokeWidth={1} className="mb-3 opacity-30" />
                  <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('status.emptyFav')}</p>
                  <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('status.emptyFavHint')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-text-dim">
                  <Search size={32} strokeWidth={1} className="mb-3 opacity-30" />
                  <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('search.noResults')}</p>
                  <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('search.tryOther')}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} inventory={inventory} lang={lang}
                    onClick={() => handleSelect(recipe)} onQuickAddMissing={onQuickAddMissing}
                    onFavorite={() => onToggleRecipeFavorite(recipe.id)}
                    isFavorited={favoriteIds.has(recipe.id)}
                    matchScore={recipeScores.get(recipe.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="h-4 flex-shrink-0" />

      {/* Back-to-top FAB */}
      {showFab && (
        <button onClick={scrollToTop}
          className="fixed bottom-20 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 animate-in z-40"
          style={{ background: 'rgba(18, 22, 32, 0.9)', border: '1px solid rgba(0, 229, 255, 0.15)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
          <ArrowUp size={18} strokeWidth={1.5} className="text-ice-400" />
        </button>
      )}
    </div>
  )
}
