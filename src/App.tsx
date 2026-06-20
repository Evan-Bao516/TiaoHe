import { useState, useCallback, useMemo, useEffect } from 'react'
import { Timer, ChevronRight, Minus, Plus } from 'lucide-react'
import type { Recipe, Category, MealPlan } from './data/types'
import { RECIPES } from './data/recipes'
import { useStoredState } from './hooks/useStoredState'
import { usePreferenceEngine } from './hooks/usePreferenceEngine'
import { useCookJournal } from './hooks/useCookJournal'
import { useMealPlanner } from './hooks/useMealPlanner'
import { useToast } from './components/ToastProvider'
import { useLang } from './i18n/context'
import { haptic } from './utils/haptic'
import Header from './components/Header'
import AlchemistCore from './components/AlchemistCore'
import IngredientList from './components/IngredientList'
import IgnitionButton from './components/IgnitionButton'
import FocusMode from './components/FocusMode'
import CartSheet from './components/CartSheet'
import InventoryPanel from './components/InventoryPanel'
import StandaloneTimer from './components/StandaloneTimer'
import CookEntryForm from './components/CookEntryForm'
import RecipeList from './components/RecipeList'
export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isFocusMode, setFocusMode] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null)
  const [activeSubstitutions, setActiveSubstitutions] = useState<Set<string>>(new Set())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'browse' | 'journal' | 'reverseSearch' | 'planner' | 'nutrition'>('discover')
  const [drinkSub, setDrinkSub] = useState<'all' | 'alcoholic' | 'nonalcoholic'>('all')
  const [browseSub, setBrowseSub] = useState<Category | 'all'>('all')
  const [servings, setServings] = useState(2)
  const [journalFormRecipe, setJournalFormRecipe] = useState<Recipe | null>(null)
  const [journalFormRatio, setJournalFormRatio] = useState(1)
  const { toast } = useToast()
  const { lang, t } = useLang()
  const engine = usePreferenceEngine()
  const journal = useCookJournal()
  const planner = useMealPlanner()
  const recipeScores = useMemo(
    () => engine.scoreAll(RECIPES),
    [engine.scoreAll],
  )
  const preferenceTags = useMemo(
    () => engine.generateTags(lang),
    [engine.generateTags, lang],
  )

  /* ── Persistent state ─────────────────────────────────────── */
  const [_invArr, setInvArr] = useStoredState<string[]>('inventory', [])
  const inventory = useMemo(() => new Set(_invArr), [_invArr])
  const setInventory = useCallback((v: Set<string> | ((p: Set<string>) => Set<string>)) => {
    setInvArr((prevArr) => {
      const prev = new Set(prevArr)
      const next = typeof v === 'function' ? (v as (p: Set<string>) => Set<string>)(prev) : v
      return [...next]
    })
  }, [setInvArr])

  const [cartItems, setCartItems] = useStoredState<Record<string, number>>('cartItems', {})
  const [recentIds, setRecentIds] = useStoredState<string[]>('recentIds', [])
  const [_favArr, setFavArr] = useStoredState<string[]>('favoriteIds', [])
  const favoriteIds = useMemo(() => new Set(_favArr), [_favArr])

  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)
  const isFavorited = selectedRecipe ? favoriteIds.has(selectedRecipe.id) : false

  /* Missing ingredients accounting for active substitutions */
  const { missingIds, substitutedIds } = useMemo(() => {
    if (!selectedRecipe || inventory.size === 0) {
      return { missingIds: new Set<string>(), substitutedIds: new Set<string>() }
    }
    const missing = new Set<string>()
    const substituted = new Set<string>()
    for (const ing of selectedRecipe.ingredients) {
      const hasOriginal = inventory.has(ing.nameZh)
      if (hasOriginal) continue // have it → not missing

      /* Check if an active substitution covers this ingredient */
      const isSubActive = activeSubstitutions.has(ing.id)
      const subName = ing.substitution?.nameZh
      if (isSubActive && subName && inventory.has(subName)) {
        substituted.add(ing.id) // substitution covers it
      } else {
        missing.add(ing.id) // truly missing
      }
    }
    return { missingIds: missing, substitutedIds: substituted }
  }, [selectedRecipe, inventory, activeSubstitutions])

  /* Auto-expand if exactly 1 ingredient is missing */
  useEffect(() => {
    if (selectedRecipe && inventory.size > 0 && missingIds.size === 1) {
      const [id] = missingIds
      setSelectedIngredient(id)
    }
  }, [selectedRecipe?.id, missingIds.size])

  const handleBack = useCallback(() => {
    window.scrollTo(0, 0)
    setSelectedRecipe(null)
    setFocusMode(false)
    setSelectedIngredient(null)
    setActiveSubstitutions(new Set())
    setIsCartOpen(false)
    setExpandedStep(null)
    setJournalFormRecipe(null)
  }, [])

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    window.scrollTo(0, 0)
    setSelectedRecipe(recipe)
    setFocusMode(false)
    setSelectedIngredient(null)
    setExpandedStep(null)
    /* Track history */
    setRecentIds((prev) => {
      const next = [recipe.id, ...prev.filter((id) => id !== recipe.id)]
      return next.slice(0, 10)
    })
    /* Auto-activate substitutions for missing ingredients that have subs in inventory */
    if (inventory.size > 0) {
      const autoSubs = new Set<string>()
      for (const ing of recipe.ingredients) {
        if (!inventory.has(ing.nameZh) && ing.substitution && inventory.has(ing.substitution.nameZh)) {
          autoSubs.add(ing.id)
        }
      }
      setActiveSubstitutions(autoSubs)
    } else {
      setActiveSubstitutions(new Set())
    }
    engine.record(recipe, 'view')
  }, [inventory, engine])

  const handleToggleFavorite = useCallback(() => {
    if (!selectedRecipe) return
    const wasFavorited = favoriteIds.has(selectedRecipe.id)
    setFavArr((prev) =>
      prev.includes(selectedRecipe.id)
        ? prev.filter((id) => id !== selectedRecipe.id)
        : [...prev, selectedRecipe.id],
    )
    engine.record(selectedRecipe, wasFavorited ? 'unfavorite' : 'favorite')
    toast(wasFavorited ? t('toast.unfavorited') : t('toast.favorited'))
    haptic('medium')
  }, [selectedRecipe, setFavArr, toast, favoriteIds, engine, t])

  const handleToggleSubstitution = useCallback((id: string) => {
    setActiveSubstitutions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleAddToCart = useCallback((id: string) => {
    setCartItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
    if (selectedRecipe) engine.record(selectedRecipe, 'cart')
    toast(t('toast.addedCart'))
    haptic('light')
  }, [toast, selectedRecipe, engine, t])

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems((prev) => {
      const next = { ...prev }
      if ((next[id] ?? 0) <= 1) delete next[id]
      else next[id] = (next[id] ?? 1) - 1
      return next
    })
  }, [])

  const handleClearCart = useCallback(() => { setCartItems({}); toast(t('toast.clearedCart')) }, [toast, t])

  const handleAddToPlan = useCallback((recipeId: string) => {
    const plans = planner.plans
    let plan = plans[plans.length - 1]
    // Auto-create a plan if none exists
    if (!plan) {
      plan = {
        id: crypto.randomUUID(),
        name: t('plan.quickPlan'),
        createdAt: Date.now(),
        days: [],
      }
      planner.createPlan(plan)
    }
    // Add recipe as new slot to last day, or create a day
    let targetDay = plan.days[plan.days.length - 1]
    if (!targetDay) {
      targetDay = {
        id: crypto.randomUUID(),
        label: t('plan.day1'),
        slots: [],
      }
    }
    const newSlot = { id: crypto.randomUUID(), name: t('plan.meal'), recipeId }
    const updatedDays = plan.days.length === 0
      ? [{ ...targetDay, slots: [newSlot] }]
      : plan.days.map((d) => d.id === targetDay.id ? { ...d, slots: [...d.slots, newSlot] } : d)
    planner.updatePlan(plan.id, { days: updatedDays })
    toast(t('plan.added'))
  }, [planner, t, toast])

  const handleFocusComplete = useCallback((completionRatio: number) => {
    if (!selectedRecipe) return
    if (completionRatio > 0.5) {
      // Form will record with rating/tags — don't double-record here
      setJournalFormRecipe(selectedRecipe)
      setJournalFormRatio(completionRatio)
    } else {
      engine.record(selectedRecipe, 'cook')
      setJournalFormRecipe(null) // don't show form
    }
  }, [engine, selectedRecipe])

  const handleToggleInventory = useCallback((nameZh: string) => {
    setInventory((prev) => {
      const next = new Set(prev)
      if (next.has(nameZh)) next.delete(nameZh)
      else next.add(nameZh)
      return next
    })
  }, [])

  /* Quick-add all missing ingredients of a recipe to cart */
  const handleQuickAddMissing = useCallback((recipe: Recipe) => {
    setCartItems((prev) => {
      const next = { ...prev }
      for (const ing of recipe.ingredients) {
        if (!inventory.has(ing.nameZh)) {
          next[ing.id] = (next[ing.id] ?? 0) + 1
        }
      }
      return next
    })
  }, [inventory])

  /* Generate meal plan list → merge all plan recipe IDs into cart */
  const handleGenerateMealPlanList = useCallback((plan: MealPlan) => {
    const allIds: string[] = []
    for (const day of plan.days) {
      for (const slot of day.slots) {
        if (slot.recipeId) allIds.push(slot.recipeId)
      }
    }
    setCartItems((prev) => {
      const next = { ...prev }
      for (const id of allIds) {
        next[id] = (next[id] ?? 0) + 1
      }
      return next
    })
    toast(t('planner.listGenerated'))
  }, [toast, t])

  return (
    <>
      {/* ── Browse ──────────────────────────────────────────────── */}
      {!selectedRecipe && (
        <div>
          <RecipeList
            cartCount={cartCount}
            inventory={inventory}
            recentIds={recentIds}
            favoriteIds={favoriteIds}
            recipeScores={recipeScores}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            drinkSub={drinkSub}
            onDrinkSubChange={setDrinkSub}
            browseSub={browseSub}
            onBrowseSubChange={setBrowseSub}
            onSelect={handleSelectRecipe}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenTimer={() => setIsTimerOpen(true)}
            onQuickAddMissing={handleQuickAddMissing}
            onToggleRecipeFavorite={(id) => {
              setFavArr((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
              haptic('medium')
            }}
            onAddToInventory={handleToggleInventory}
            preferenceTags={preferenceTags}
            onResetPreferences={engine.reset}
            onGenerateMealPlanList={handleGenerateMealPlanList}
            onAddToCart={handleAddToCart}
            onAddToPlan={(id) => handleAddToPlan(id)}
          />
        </div>
      )}

      {/* ── Recipe Detail (Overview) ────────────────────────────── */}
      {selectedRecipe && !isFocusMode && (
        <div key={`detail-${selectedRecipe.id}`} className="min-h-svh flex flex-col page-enter-forward" style={{ background: '#0A0E17' }}>
          <Header
            nameZh={lang === 'en' ? selectedRecipe.nameEn : selectedRecipe.nameZh}
            nameEn={lang === 'en' ? selectedRecipe.nameZh : selectedRecipe.nameEn}
            isFavorited={isFavorited}
            cartCount={cartCount}
            onBack={handleBack}
            onToggleFavorite={handleToggleFavorite}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Info bar */}
          <div className="px-5 py-3 flex items-center gap-4 text-[11px]"
            style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)', fontFamily: 'var(--font-mono)' }}>
            <span className="flex items-center gap-1.5" style={{ color: '#F4F4F4' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedRecipe.difficulty === 'easy' ? '#10B981' : selectedRecipe.difficulty === 'medium' ? '#FF9F0A' : '#FF2E93' }} />
              {selectedRecipe.difficulty === 'easy' ? t('diff.easy') : selectedRecipe.difficulty === 'medium' ? t('diff.medium') : t('diff.hard')}
            </span>
            <span style={{ color: '#5A6272' }}>·</span>
            <span style={{ color: '#8A94A6' }}>⏱ {selectedRecipe.prepTime}</span>
            <span style={{ color: '#5A6272' }}>·</span>
            <span style={{ color: '#8A94A6' }}>👥 {servings}{t('misc.servings')}</span>
            {selectedRecipe.tags.length > 0 && (
              <>
                <span style={{ color: '#5A6272' }}>·</span>
                <span style={{ color: '#5A6272' }}>{selectedRecipe.tags.slice(0, 2).join(' · ')}</span>
              </>
            )}
            <div className="flex-1" />
            <button onClick={() => handleAddToPlan(selectedRecipe.id)}
              className="text-[10px] px-2 py-0.5 rounded transition-colors hover:brightness-110"
              style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
              + {t('plan.addToPlan')}
            </button>
          </div>

          {/* Servings scaler */}
          <div className="px-5 py-2.5 flex items-center justify-center gap-3"
            style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)' }}>
            <span className="text-[10px] tracking-[0.08em] uppercase text-text-dim"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('detail.servings')}</span>
            <button onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-7 h-7 flex items-center justify-center rounded text-text-dim hover:text-text-primary hover:bg-charcoal-800 transition-colors">
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <span className="text-[15px] text-text-primary w-8 text-center"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{servings}</span>
            <button onClick={() => setServings((s) => Math.min(8, s + 1))}
              className="w-7 h-7 flex items-center justify-center rounded text-text-dim hover:text-text-primary hover:bg-charcoal-800 transition-colors">
              <Plus size={14} strokeWidth={1.5} />
            </button>
            <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>{t('detail.servingsUnit')}</span>
          </div>

          <main className="flex-1 flex flex-col">
            <AlchemistCore
              activeSubstitutions={activeSubstitutions}
              flavorProfile={selectedRecipe.flavorProfile}
              macros={selectedRecipe.macros}
              totalKcal={selectedRecipe.totalKcal}
              ingredients={selectedRecipe.ingredients}
            />

            <div className="px-4"><div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.08)' }} /></div>

            <IngredientList
              ingredients={selectedRecipe.ingredients}
              selectedIngredient={selectedIngredient}
              activeSubstitutions={activeSubstitutions}
              cartItems={cartItems}
              missingIds={missingIds}
              substitutedIds={substitutedIds}
              servings={servings}
              onSelect={setSelectedIngredient}
              onToggleSubstitution={handleToggleSubstitution}
              onAddToCart={handleAddToCart}
            />

            <div className="px-4"><div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.08)' }} /></div>

            <section className="px-4 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 12, height: 1, background: '#00E5FF', opacity: 0.5 }} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>Protocol</span>
              </div>
              <div className="flex flex-col gap-0">
                {selectedRecipe.steps.map((step, i) => {
                  const isExpanded = expandedStep === i
                  return (
                    <div key={step.en} style={{ borderBottom: i < selectedRecipe.steps.length - 1 ? '1px solid rgba(0, 229, 255, 0.04)' : 'none' }}>
                      <button onClick={() => setExpandedStep(isExpanded ? null : i)}
                        className={`w-full flex items-center gap-3 py-2.5 text-left group transition-colors duration-200 hover:bg-charcoal-800/50 ${isExpanded ? 'bg-charcoal-800/30' : ''}`}>
                        <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[11px]"
                          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isExpanded ? '#F4F4F4' : '#00E5FF', background: isExpanded ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0, 229, 255, 0.06)', border: isExpanded ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(0, 229, 255, 0.1)' }}>
                          {i + 1}</span>
                        <span className="text-[14px] flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#F4F4F4' }}>{lang === 'en' ? step.en : step.zh}</span>
                        <span className="text-[11px] flex items-center gap-1 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6' }}><Timer size={11} strokeWidth={1.5} />{step.duration}</span>
                        <ChevronRight size={14} strokeWidth={1.5} className={`flex-shrink-0 transition-all duration-300 ${isExpanded ? 'rotate-90 text-ice-400 opacity-100' : 'text-text-dim opacity-0 group-hover:opacity-100'}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-[13px] leading-relaxed px-4 pb-4 ml-9" style={{ fontFamily: 'var(--font-body)', color: '#8A94A6' }}>{lang === 'en' ? step.en : step.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </main>

          <IgnitionButton onClick={() => setFocusMode(true)} />
        </div>
      )}

      {/* ── Focus Mode ──────────────────────────────────────────── */}
      {selectedRecipe && isFocusMode && (
        <FocusMode key={`focus-${selectedRecipe.id}`} steps={selectedRecipe.steps} onExit={() => setFocusMode(false)} onComplete={handleFocusComplete} />
      )}

      {/* ── Standalone Timer ─────────────────────────────────── */}
      {isTimerOpen && <StandaloneTimer onClose={() => setIsTimerOpen(false)} />}

      {/* ── Inventory Panel ──────────────────────────────────── */}
      {isInventoryOpen && (
        <InventoryPanel
          inventory={inventory}
          onToggle={handleToggleInventory}
          onClearAll={() => setInventory(new Set())}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}

      {/* ── Global Cart Sheet ───────────────────────────────────── */}
      {isCartOpen && (
        <CartSheet
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onAdd={handleAddToCart}
          onRemove={handleRemoveFromCart}
          onClear={handleClearCart}
        />
      )}

      {/* ── Cooking Journal Entry Form ───────────────────── */}
      {journalFormRecipe && (
        <CookEntryForm
          recipe={journalFormRecipe}
          completionRatio={journalFormRatio}
          existingTags={journal.allTags}
          onSubmit={(data) => {
            journal.addEntry(data)
            engine.record(journalFormRecipe, 'cook', { rating: data.rating, tags: data.customTags })
            setJournalFormRecipe(null)
          }}
          onCancel={() => {
            engine.record(journalFormRecipe, 'cook')
            setJournalFormRecipe(null)
          }}
        />
      )}
    </>
  )
}
