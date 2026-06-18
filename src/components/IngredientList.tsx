import { ChevronDown, ArrowRightLeft, Plus, Check, ShoppingCart } from 'lucide-react'
import { useLang } from '../i18n/context'
import type { Ingredient } from '../data/types'

function scaleAmount(amount: string, servings: number): string {
  if (servings === 2) return amount
  const m = amount.match(/^([\d/.]+)\s*(.+)$/)
  if (!m) return amount
  const raw = m[1]
  let num: number
  if (raw.includes('/')) {
    const [numer, denom] = raw.split('/')
    num = parseFloat(numer) / parseFloat(denom)
  } else {
    num = parseFloat(raw)
  }
  if (isNaN(num)) return amount
  const scaled = Math.round(num * servings / 2 * 10) / 10
  return `${scaled}${m[2]}`
}

interface IngredientListProps {
  ingredients: Ingredient[]
  selectedIngredient: string | null
  activeSubstitutions: Set<string>
  cartItems: Record<string, number>
  missingIds: Set<string>
  substitutedIds: Set<string>
  servings: number
  onSelect: (id: string | null) => void
  onToggleSubstitution: (id: string) => void
  onAddToCart: (id: string) => void
}

export default function IngredientList({
  ingredients,
  selectedIngredient,
  activeSubstitutions,
  cartItems,
  missingIds,
  substitutedIds,
  servings,
  onSelect,
  onToggleSubstitution,
  onAddToCart,
}: IngredientListProps) {
  const { t } = useLang()
  return (
    <section className="px-4 pb-4">
      {/* Section eyebrow */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 12, height: 1, background: '#00E5FF', opacity: 0.5 }} />
        <span
          className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Components
        </span>
      </div>

      {/* Ingredient grid */}
      {ingredients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-md"
          style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.06)' }}>
          <span className="text-[12px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
            {t('detail.theoryLabel')}
          </span>
        </div>
      ) : (
        <div
          className="grid gap-px rounded-md overflow-hidden"
          style={{ background: 'rgba(0, 229, 255, 0.06)', gridTemplateColumns: '1fr' }}>
          {ingredients.map((ing) => {
          const isExpanded = selectedIngredient === ing.id
          const hasSub = !!ing.substitution

          const isMissing = missingIds.has(ing.id)
          const isSubstituted = substitutedIds.has(ing.id)
          const needsAttention = isMissing || isSubstituted

            return (
            <div key={ing.id} className="bg-charcoal-900"
              style={{
                boxShadow: isMissing ? 'inset 2px 0 0 rgba(255, 159, 10, 0.3)' : isSubstituted ? 'inset 2px 0 0 rgba(16, 185, 129, 0.3)' : 'none',
              }}>
              {/* Row */}
              <div className="flex items-center"
                style={{ background: isMissing ? 'rgba(255, 159, 10, 0.02)' : isSubstituted ? 'rgba(16, 185, 129, 0.02)' : 'transparent' }}>
                {/* Add to cart button */}
                {isMissing && !cartItems[ing.id] ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(ing.id) }}
                    className="flex items-center justify-center w-10 h-[52px] flex-shrink-0 text-amber-500 hover:text-amber-400 hover:bg-charcoal-800 transition-all duration-200"
                    aria-label={`Add missing ${ing.nameZh} to cart`}
                  >
                    <ShoppingCart size={16} strokeWidth={1.5} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(ing.id) }}
                    className={`flex items-center justify-center w-10 h-[52px] flex-shrink-0 transition-all duration-200
                      ${cartItems[ing.id] > 0 ? 'text-ice-400' : 'text-text-dim hover:text-ice-400 hover:bg-charcoal-800'}`}
                    aria-label={cartItems[ing.id] > 0 ? `${ing.nameZh} in cart` : `Add ${ing.nameZh} to cart`}
                  >
                    {cartItems[ing.id] > 0 ? <Check size={18} strokeWidth={2} /> : <Plus size={18} strokeWidth={1.5} />}
                  </button>
                )}

                {/* Main row content */}
                <button
                  className={`flex-1 flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-charcoal-800 ${isExpanded ? 'bg-charcoal-800' : ''}`}
                  onClick={() => onSelect(isExpanded ? null : ing.id)}
                  disabled={!hasSub && !needsAttention}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Dot indicator */}
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: isMissing ? '#FF9F0A' : isSubstituted ? '#10B981' : hasSub ? '#FF9F0A' : 'rgba(0, 229, 255, 0.3)',
                        boxShadow: isMissing ? '0 0 6px rgba(255, 159, 10, 0.4)' : isSubstituted ? '0 0 6px rgba(16, 185, 129, 0.3)' : 'none',
                      }}
                    />

                    <span className="text-[15px] text-text-primary truncate"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: needsAttention ? 600 : 500 }}>
                      {ing.nameZh}
                    </span>

                    {isSubstituted && ing.substitution && (
                      <span className="text-[10px] text-emerald-400"
                        style={{ fontFamily: 'var(--font-mono)' }}>
                        → {ing.substitution.nameZh}
                      </span>
                    )}

                    <span className="text-[12px] text-text-muted hidden sm:inline">{ing.nameEn}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isMissing && (
                      <span className="text-[10px] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                        style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: '#FF9F0A', background: 'rgba(255, 159, 10, 0.1)',
                          border: '1px solid rgba(255, 159, 10, 0.2)',
                        }}>{t('status.missing')}</span>
                    )}
                    {isSubstituted && (
                      <span className="text-[10px] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                        style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: '#10B981', background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}>{t('status.substituted')}</span>
                    )}
                    <span className="text-[13px] text-text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{scaleAmount(ing.amount, servings)}</span>
                    {(hasSub || needsAttention) && (
                      <ChevronDown size={16} strokeWidth={1.5}
                        className={`text-text-dim transition-transform duration-300 ${isExpanded ? (isSubstituted ? 'rotate-180 text-emerald-400' : 'rotate-180 text-amber-500') : ''}`} />
                    )}
                  </div>
                </button>
              </div>

              {/* Missing ingredient panel (no substitution) */}
              {isMissing && isExpanded && !hasSub && (
                <div className="px-4 pb-4 animate-in" style={{ borderTop: '1px solid rgba(255, 159, 10, 0.08)' }}>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={14} strokeWidth={1.5} style={{ color: '#FF9F0A' }} />
                      <span className="text-[13px] text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('detail.missing')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddToCart(ing.id) }}
                      className="px-3 py-1.5 rounded-md text-[11px] tracking-wider font-medium transition-all duration-200 hover:brightness-110"
                      style={{
                        fontFamily: 'var(--font-display)', color: '#FF9F0A',
                        background: 'rgba(255, 159, 10, 0.08)', border: '1px solid rgba(255, 159, 10, 0.2)',
                      }}>
                      {t('detail.addToCart')}
                    </button>
                  </div>
                </div>
              )}

              {/* Substitution panel */}
              {hasSub && isExpanded && ing.substitution && (
                <div
                  className="px-4 pb-4 animate-in"
                  style={{
                    borderTop: '1px solid rgba(0, 229, 255, 0.06)',
                  }}
                >
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={14} strokeWidth={1.5} className="text-ice-400" />
                      <span className="text-[13px] text-text-muted">
                        {t('detail.subWith')}
                      </span>
                      <span
                        className="text-[14px] text-text-primary"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                      >
                        {ing.substitution.nameZh}
                      </span>
                      <span className="text-[11px] text-text-dim">
                        {ing.substitution.nameEn}
                      </span>
                    </div>

                    {/* Toggle switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSubstitution(ing.id)
                      }}
                      className={`
                        relative inline-flex h-6 w-10 items-center rounded-md transition-all duration-300
                        ${activeSubstitutions.has(ing.id) ? 'bg-amber-500/20' : 'bg-charcoal-700'}
                      `}
                      style={{
                        border: activeSubstitutions.has(ing.id)
                          ? '1px solid rgba(255, 159, 10, 0.4)'
                          : '1px solid rgba(138, 148, 166, 0.15)',
                      }}
                      aria-pressed={activeSubstitutions.has(ing.id)}
                      aria-label={`Toggle ${ing.substitution.nameZh} substitution`}
                    >
                      <span
                        className={`
                          inline-block h-3.5 w-3.5 rounded-[2px] transition-all duration-300
                          ${activeSubstitutions.has(ing.id) ? 'translate-x-[18px] bg-amber-500' : 'translate-x-[4px] bg-text-dim'}
                        `}
                      />
                    </button>
                  </div>

                  {/* Capsule tags */}
                  {activeSubstitutions.has(ing.id) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ing.substitution.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="inline-block px-2.5 py-1 text-[11px] rounded-md"
                          style={{
                            background:
                              tag.variant === 'amber'
                                ? 'rgba(255, 159, 10, 0.1)'
                                : 'rgba(138, 148, 166, 0.08)',
                            color: tag.variant === 'amber' ? '#FF9F0A' : '#8A94A6',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            border:
                              tag.variant === 'amber'
                                ? '1px solid rgba(255, 159, 10, 0.2)'
                                : '1px solid rgba(138, 148, 166, 0.1)',
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}
    </section>
  )
}
