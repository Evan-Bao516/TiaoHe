import { useState, useMemo } from 'react'
import { Search, X, Plus, Check } from 'lucide-react'
import type { Recipe } from '../data/types'
import { useIngredientSearch, getTopIngredients, getAllIngredientNames } from '../hooks/useIngredientSearch'
import RecipeCard from './RecipeCard'
import { useLang } from '../i18n/context'

interface ReverseSearchProps {
  inventory: Set<string>
  preferenceScores: Map<string, number>
  onSelect: (recipe: Recipe) => void
  onQuickAddMissing: (recipe: Recipe) => void
  onToggleRecipeFavorite: (id: string) => void
  favoriteIds: Set<string>
  onAddToInventory: (nameZh: string) => void
  onAddToPlan?: (recipeId: string) => void
}

const QUICK_CHIPS = getTopIngredients(12)
const ALL_NAMES = getAllIngredientNames()

export default function ReverseSearch({
  inventory, preferenceScores, onSelect, onQuickAddMissing,
  onToggleRecipeFavorite, favoriteIds, onAddToInventory, onAddToPlan,
}: ReverseSearchProps) {
  const { t, lang } = useLang()
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')

  const results = useIngredientSearch(ingredients, preferenceScores)
  const { perfect, near, partial } = results
  const hasResults = perfect.length > 0 || near.length > 0 || partial.length > 0

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    const q = inputValue.trim().toLowerCase()
    return ALL_NAMES
      .filter((n) => n.toLowerCase().includes(q) && !ingredients.includes(n))
      .slice(0, 5)
  }, [inputValue, ingredients])

  const addIngredient = (name: string) => {
    if (name && !ingredients.includes(name)) {
      setIngredients((prev) => [...prev, name])
    }
    setInputValue('')
  }

  const removeIngredient = (name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue.trim())
    }
  }

  // Active section for jump buttons
  const [activeSection, setActiveSection] = useState<'perfect' | 'near' | 'partial' | null>(null)
  const [focused, setFocused] = useState(false)
  const [addedToFridge, setAddedToFridge] = useState<Set<string>>(new Set())

  const handleAddAllToInventory = (recipe: Recipe) => {
    for (const ing of recipe.ingredients) {
      if (!inventory.has(ing.nameZh)) {
        onAddToInventory(ing.nameZh)
      }
    }
    setAddedToFridge((prev) => {
      const next = new Set(prev)
      next.add(recipe.id)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Ingredient input */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <Search size={14} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={t('rsearch.placeholder')}
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-dim outline-none"
              style={{ fontFamily: 'var(--font-body)' }} />
          </div>
          {focused && inputValue && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-md overflow-hidden"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
              {suggestions.map((name) => (
                <button key={name} onClick={() => addIngredient(name)}
                  className="w-full text-left px-3 py-2 text-[12px] text-text-muted hover:bg-charcoal-800/50"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ingredient chips + clear all */}
        {ingredients.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2 items-center">
            {ingredients.map((name) => (
              <span key={name} onClick={() => removeIngredient(name)}
                className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-70 flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                {name} <X size={10} />
              </span>
            ))}
            <button onClick={() => setIngredients([])}
              className="px-2 py-0.5 rounded text-[9px] hover:text-[#FF2E93] transition-colors flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: '#5A6272' }}>
              ✕ {lang === 'en' ? 'Clear All' : '清空'}
            </button>
          </div>
        )}

        {/* Quick chips */}
        <div className="mt-2">
          <span className="text-[9px] tracking-[0.1em] uppercase text-text-dim block mb-1.5"
            style={{ fontFamily: 'var(--font-mono)' }}>{t('rsearch.quickChips')}</span>
          <div className="flex gap-1 flex-wrap">
            {QUICK_CHIPS.map((name) => {
              const isActive = ingredients.includes(name)
              return (
                <button key={name} onClick={() => isActive ? removeIngredient(name) : addIngredient(name)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: isActive ? '#F4F4F4' : '#5A6272',
                    background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid rgba(138, 148, 166, 0.1)',
                  }}>
                  {isActive ? <Check size={9} className="inline mr-0.5" /> : <Plus size={9} className="inline mr-0.5" />}
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {!hasResults && ingredients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Search size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('rsearch.empty')}</p>
          </div>
        )}

        {!hasResults && ingredients.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Search size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('rsearch.noMatch')}</p>
          </div>
        )}

        {hasResults && (
          <>
            {/* Section jump bar */}
            <div className="flex gap-2 mb-4 sticky top-0 py-2 z-10"
              style={{ background: '#0A0E17' }}>
              {[
                { key: 'perfect' as const, label: t('rsearch.perfect'), count: perfect.length, color: '#10B981' },
                { key: 'near' as const, label: t('rsearch.near'), count: near.length, color: '#FF9F0A' },
                { key: 'partial' as const, label: t('rsearch.partial'), count: partial.length, color: '#5A6272' },
              ].map(({ key, label, count, color }) => (
                <button key={key} onClick={() => { setActiveSection(key); document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' }) }}
                  disabled={count === 0}
                  className="flex-1 py-1.5 rounded text-[10px] tracking-[0.06em] transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: activeSection === key ? '#F4F4F4' : count > 0 ? color : '#2A303C',
                    background: activeSection === key ? `${color}20` : 'transparent',
                    border: activeSection === key ? `1px solid ${color}40` : '1px solid transparent',
                    opacity: count > 0 ? 1 : 0.4,
                  }}>
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Perfect matches */}
            {perfect.length > 0 && (
              <div className="mb-4" id="section-perfect">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#10B981', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.perfect')} · {perfect.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {perfect.map((r) => (
                    <RecipeCard key={r.recipe.id} recipe={r.recipe} inventory={inventory} lang={lang}
                      onClick={() => onSelect(r.recipe)}
                      onQuickAddMissing={onQuickAddMissing}
                      onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                      isFavorited={favoriteIds.has(r.recipe.id)}
                      matchBadge={{ type: 'perfect', missingCount: 0, substitutableCount: r.substitutableCount }} />
                  ))}
                </div>
              </div>
            )}

            {/* Near matches */}
            {near.length > 0 && (
              <div className="mb-4" id="section-near">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#FF9F0A', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.near')} · {near.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {near.map((r) => (
                    <div key={r.recipe.id} className="relative">
                      <RecipeCard recipe={r.recipe} inventory={inventory} lang={lang}
                        onClick={() => onSelect(r.recipe)}
                        onQuickAddMissing={onQuickAddMissing}
                        onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                        isFavorited={favoriteIds.has(r.recipe.id)}
                        matchBadge={{ type: 'near', missingCount: r.missingCount, substitutableCount: r.substitutableCount }} />
                      {!addedToFridge.has(r.recipe.id) && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {onAddToPlan && (
                            <button onClick={(e) => { e.stopPropagation(); onAddToPlan(r.recipe.id) }}
                              className="px-2 py-0.5 rounded text-[9px] transition-all hover:brightness-110"
                              style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                              {t('plan.addToPlan')}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleAddAllToInventory(r.recipe) }}
                            className="px-2 py-0.5 rounded text-[9px] transition-all hover:brightness-110"
                            style={{ fontFamily: 'var(--font-mono)', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            + {t('rsearch.addToInventory')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partial matches */}
            {partial.length > 0 && (
              <div className="mb-4" id="section-partial">
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: '#5A6272', borderRadius: 1 }} />
                  <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {t('rsearch.partial')} · {partial.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {partial.map((r) => (
                    <div key={r.recipe.id} className="relative">
                      <RecipeCard recipe={r.recipe} inventory={inventory} lang={lang}
                        onClick={() => onSelect(r.recipe)}
                        onQuickAddMissing={onQuickAddMissing}
                        onFavorite={() => onToggleRecipeFavorite(r.recipe.id)}
                        isFavorited={favoriteIds.has(r.recipe.id)}
                        matchBadge={{ type: 'partial', missingCount: r.missingCount, substitutableCount: r.substitutableCount }} />
                      {!addedToFridge.has(r.recipe.id) && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {onAddToPlan && (
                            <button onClick={(e) => { e.stopPropagation(); onAddToPlan(r.recipe.id) }}
                              className="px-2 py-0.5 rounded text-[9px] transition-all hover:brightness-110"
                              style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                              {t('plan.addToPlan')}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleAddAllToInventory(r.recipe) }}
                            className="px-2 py-0.5 rounded text-[9px] transition-all hover:brightness-110"
                            style={{ fontFamily: 'var(--font-mono)', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            + {t('rsearch.addToInventory')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
