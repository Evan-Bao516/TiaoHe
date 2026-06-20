import { useRef, useCallback, useState } from 'react'
import { Clock, ChevronRight, ChefHat, Flame, Sparkles, BookOpen, ShoppingCart } from 'lucide-react'
import type { Recipe } from '../data/types'
import { useLang } from '../i18n/context'

interface RecipeCardProps {
  recipe: Recipe
  inventory: Set<string>
  lang?: 'zh' | 'en'
  onClick: () => void
  onQuickAddMissing: (recipe: Recipe) => void
  onFavorite?: () => void
  isFavorited?: boolean
  matchScore?: number
  matchBadge?: { type: 'perfect' | 'near' | 'partial'; missingCount: number; substitutableCount: number }
}

const CATEGORY_META: Record<string, { icon: typeof ChefHat; color: string }> = {
  chinese:  { icon: Flame,    color: '#FF9F0A' },
  western:  { icon: ChefHat,  color: '#00E5FF' },
  drink:    { icon: Sparkles, color: '#FF2E93' },
  basic:    { icon: BookOpen, color: '#10B981' },
}

function flavorTags(fp: Recipe['flavorProfile'], t: (k: string) => string): string[] {
  const tags: string[] = []
  if (fp.umami > 0.6) tags.push(t('card.flavor.umami'))
  if (fp.spicy > 0.6) tags.push(t('card.flavor.spicy'))
  else if (fp.spicy > 0.3) tags.push(t('card.flavor.mildSpicy'))
  if (fp.acid > 0.5) tags.push(t('card.flavor.acid'))
  if (fp.sweet > 0.4) tags.push(t('card.flavor.sweet'))
  if (fp.salty > 0.5) tags.push(t('card.flavor.salty'))
  if (fp.bitter > 0.2) tags.push(t('card.flavor.bitter'))
  return tags.slice(0, 3)
}

export default function RecipeCard({ recipe, inventory, lang, onClick, onQuickAddMissing, onFavorite, isFavorited, matchScore, matchBadge }: RecipeCardProps) {
  const meta = CATEGORY_META[recipe.category]
  const Icon = meta.icon
  const { t } = useLang()
  const l = lang ?? 'zh'
  const touchStartX = useRef(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (showPreview) { setShowPreview(false); return }
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 60) return
    if (dx > 60 && onFavorite) { onFavorite(); return }
    if (dx < -60) onQuickAddMissing(recipe)
  }, [onFavorite, onQuickAddMissing, recipe, showPreview])

  /* Long press: start timer on touch/mouse down */
  const handlePressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowPreview(true), 500)
  }, [])
  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }, [])

  const totalIngredients = recipe.ingredients.length
  let haveCount = 0; let subCovered = 0; let trulyMissing = 0
  for (const ing of recipe.ingredients) {
    if (inventory.has(ing.nameZh)) haveCount++
    else if (ing.substitution && inventory.has(ing.substitution.nameZh)) subCovered++
    else trulyMissing++
  }
  const effectiveHave = haveCount + subCovered
  const isReady = trulyMissing === 0
  const canSubAll = trulyMissing === 0 && subCovered > 0
  const isClose = trulyMissing === 1
  const flavors = flavorTags(recipe.flavorProfile, t)
  const isAlcoholic = recipe.tags.includes('含酒精')
  const isNonAlcoholic = recipe.tags.includes('无酒精')

  return (
    <button ref={cardRef} onClick={onClick}
      onTouchStart={(e) => { handleTouchStart(e); handlePressStart() }}
      onTouchEnd={(e) => { handleTouchEnd(e); handlePressEnd() }}
      onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
      className="w-full text-left rounded-lg overflow-hidden transition-all duration-300 group flex relative
        hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,229,255,0.08)]"
      style={{ background: '#121620', border: isReady ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(0, 229, 255, 0.06)' }}>

      {/* Left accent strip */}
      <div className="w-1 flex-shrink-0" style={{ background: isReady ? '#10B981' : recipe.accent, opacity: isReady ? 0.6 : 0.8 }} />

      <div className="flex-1 p-4 min-w-0">
        {/* Category + match */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: meta.color, border: `1px solid ${meta.color}33` }}>
            <Icon size={10} strokeWidth={1.5} />{t(`tab.${recipe.category}`)}
          </span>

          <div className="flex items-center gap-2">
            {canSubAll && (
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: '#10B981' }}>{t('card.subAll')}</span>
            )}
            {trulyMissing > 0 && (
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: isClose ? '#FF9F0A' : '#5A6272' }}>
                {t('card.missing')} {trulyMissing}
              </span>
            )}
            <span className={`inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full text-[8px] font-bold
              ${isReady ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-charcoal-700 text-text-dim'}`}
              style={{ fontFamily: 'var(--font-mono)' }}>{effectiveHave}/{totalIngredients}</span>
          </div>
        </div>

        {/* Recipe name + emoji */}
        <h3 className="text-[15px] leading-tight mb-0.5 text-text-primary flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          <span>{recipe.emoji}</span>
          {l === 'en' ? recipe.nameEn : recipe.nameZh}
          {isFavorited && <span className="text-[11px]">❤️</span>}
        </h3>
        <p className="text-[10px] tracking-[0.04em] uppercase text-text-muted mb-3"
          style={{ fontFamily: 'var(--font-body)' }}>{l === 'en' ? recipe.nameZh : recipe.nameEn}</p>

        {/* Flavor tags + time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Alcohol badge for drinks */}
            {isAlcoholic && (
              <span className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ fontFamily: 'var(--font-body)', color: '#FF2E93', background: 'rgba(255, 46, 147, 0.08)', border: '1px solid rgba(255, 46, 147, 0.2)' }}>
                🍸 {t('drink.alcoholic')}
              </span>
            )}
            {isNonAlcoholic && (
              <span className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ fontFamily: 'var(--font-body)', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                🍃 {t('drink.nonalcoholic')}
              </span>
            )}
            {flavors.map((f) => (
              <span key={f} className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ fontFamily: 'var(--font-body)', color: recipe.accent, background: `${recipe.accent}14`, border: `1px solid ${recipe.accent}22` }}>
                {f}
              </span>
            ))}
            <span className="text-[10px] text-text-dim flex items-center gap-1">
              <Clock size={10} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{recipe.prepTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isClose && (
              <span onClick={(e) => { e.stopPropagation(); onQuickAddMissing(recipe) }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#FF9F0A', background: 'rgba(255, 159, 10, 0.08)', border: '1px solid rgba(255, 159, 10, 0.2)' }}>
                <ShoppingCart size={9} strokeWidth={1.5} />{t('card.replenish')}
              </span>
            )}
            <ChevronRight size={14} strokeWidth={1.5}
              className={`transition-all duration-300 group-hover:translate-x-0.5 ${isReady ? 'text-emerald-400' : 'text-text-dim group-hover:text-ice-400'}`} />
          </div>
        </div>
      </div>

      {/* Match score indicator */}
      {matchScore !== undefined && matchScore > 0.5 && (
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: matchScore > 0.8 ? '#10B981' : 'rgba(0, 229, 255, 0.2)',
            boxShadow: matchScore > 0.8 ? '0 0 4px rgba(16, 185, 129, 0.4)' : 'none',
          }}
        />
      )}

      {/* Reverse search match badge */}
      {matchBadge && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-1"
          style={{
            fontFamily: 'var(--font-mono)',
            color: matchBadge.type === 'perfect' ? '#10B981' : matchBadge.type === 'near' ? '#FF9F0A' : '#5A6272',
            background: matchBadge.type === 'perfect' ? 'rgba(16, 185, 129, 0.12)' : matchBadge.type === 'near' ? 'rgba(255, 159, 10, 0.1)' : 'rgba(90, 98, 114, 0.08)',
            border: matchBadge.type === 'perfect' ? '1px solid rgba(16, 185, 129, 0.3)' : matchBadge.type === 'near' ? '1px solid rgba(255, 159, 10, 0.25)' : '1px solid rgba(90, 98, 114, 0.12)',
          }}>
          {matchBadge.type === 'perfect'
            ? (l === 'en' ? 'Perfect' : '全齐')
            : matchBadge.type === 'near'
              ? `${l === 'en' ? 'Miss' : '缺'} ${matchBadge.missingCount}`
              : `${matchBadge.missingCount}+ ${l === 'en' ? 'missing' : '缺'}`
          }
        </div>
      )}

      {/* Long-press preview popup */}
      {showPreview && (
        <div className="absolute inset-0 z-10 flex items-center justify-center animate-in rounded-lg"
          style={{ background: 'rgba(10, 14, 23, 0.92)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center px-5">
            <span className="text-[28px] block mb-2">{recipe.emoji}</span>
            <p className="text-[15px] text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{recipe.nameZh}</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-text-muted"
              style={{ fontFamily: 'var(--font-mono)' }}>
              <span>⏱ {recipe.prepTime}</span>
              <span>📋 {recipe.steps.length} {t('misc.steps')}</span>
              <span>🛒 {totalIngredients} {t('misc.items')}</span>
            </div>
          </div>
        </div>
      )}
    </button>
  )
}
