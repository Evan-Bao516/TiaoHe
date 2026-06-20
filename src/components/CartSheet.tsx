import { useEffect, useState, useMemo } from 'react'
import { Minus, Plus, ShoppingCart, ChevronLeft, Trash2, Sparkles, Copy, Check } from 'lucide-react'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface CartSheetProps {
  cartItems: Record<string, number>
  onClose: () => void
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

interface SourceEntry {
  ingredientId: string
  amount: string
  recipeName: string
  recipeId: string
  qty: number
}

interface MergedEntry {
  nameZh: string
  nameEn: string
  totalQty: number
  sources: SourceEntry[]
}

/* Parse "15g" → {value:15, unit:"g"}, "1个" → {value:1, unit:"个"}, null for "适量" */
function parseAmount(s: string): { value: number; unit: string } | null {
  const m = s.match(/^([\d.]+)\s*(g|kg|ml|L|个|支|瓣|茶匙|汤匙|杯|片|条|滴)/)
  if (m) return { value: parseFloat(m[1]), unit: m[2] }
  return null
}

export default function CartSheet({ cartItems, onClose, onAdd, onRemove, onClear }: CartSheetProps) {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)
  const [showingList, setShowingList] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  /* ── Build merged entries ─────────────────────────────────── */
  const mergedEntries = useMemo(() => {
    const raw: SourceEntry[] = []
    for (const recipe of RECIPES) {
      for (const ing of recipe.ingredients) {
        const qty = cartItems[ing.id]
        if (qty && qty > 0) {
          raw.push({ ingredientId: ing.id, amount: ing.amount, recipeName: recipe.nameZh, recipeId: recipe.id, qty })
        }
      }
    }

    const nameEnLookup = new Map<string, string>()
    for (const recipe of RECIPES) {
      for (const ing of recipe.ingredients) {
        if (!nameEnLookup.has(ing.nameZh)) nameEnLookup.set(ing.nameZh, ing.nameEn)
      }
    }

    const nameMap = new Map<string, { nameEn: string; sources: SourceEntry[] }>()
    for (const item of raw) {
      let nameZh = ''
      for (const recipe of RECIPES) {
        const ing = recipe.ingredients.find((i) => i.id === item.ingredientId)
        if (ing) { nameZh = ing.nameZh; break }
      }
      if (!nameZh) continue
      const existing = nameMap.get(nameZh)
      if (existing) existing.sources.push(item)
      else nameMap.set(nameZh, { nameEn: nameEnLookup.get(nameZh) ?? '', sources: [item] })
    }

    const merged: MergedEntry[] = []
    for (const [nameZh, data] of nameMap) {
      merged.push({
        nameZh,
        nameEn: data.nameEn,
        totalQty: data.sources.reduce((s, src) => s + src.qty, 0),
        sources: data.sources.sort((a, b) => b.qty - a.qty),
      })
    }
    return merged.sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
  }, [cartItems])

  const totalItems = mergedEntries.reduce((s, e) => s + e.totalQty, 0)
  const uniqueRecipes = [...new Set(mergedEntries.flatMap((e) => e.sources.map((s) => s.recipeId)))]

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleAdd = (entry: MergedEntry) => {
    if (entry.sources.length > 0) onAdd(entry.sources[0].ingredientId)
  }
  const handleRemove = (entry: MergedEntry) => {
    if (entry.sources.length > 0) onRemove(entry.sources[0].ingredientId)
  }

  /* Copy list to clipboard */
  const handleCopy = async () => {
    const lines: string[] = []
    lines.push(t('clist.recipes'))
    for (const rid of uniqueRecipes) {
      const r = RECIPES.find((x) => x.id === rid)
      if (r) lines.push(`  · ${r.nameZh} (${r.nameEn})`)
    }
    lines.push('')
    lines.push(t('clist.shopping'))
    for (const entry of mergedEntries) {
      const parts = entry.sources.map((s) => `${s.amount} × ${s.qty}${t('clist.servings')} (${s.recipeName})`)
      lines.push(`  ${entry.nameZh}  ${parts.join('  ')}`)
    }
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* For list view: compute totals when units match across sources */
  const computeTotals = (entry: MergedEntry) => {
    const groups = new Map<string, { totalValue: number; sources: { amount: string; qty: number; recipeName: string }[] }>()
    for (const s of entry.sources) {
      const parsed = parseAmount(s.amount)
      const key = parsed?.unit ?? s.amount // group by unit, or raw string for unparseable
      const g = groups.get(key)
      if (g) {
        g.sources.push({ amount: s.amount, qty: s.qty, recipeName: s.recipeName })
        if (parsed) g.totalValue += parsed.value * s.qty
      } else {
        groups.set(key, {
          totalValue: parsed ? parsed.value * s.qty : 0,
          sources: [{ amount: s.amount, qty: s.qty, recipeName: s.recipeName }],
        })
      }
    }
    return groups
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-400 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: '#080C13', paddingTop: 'env(safe-area-inset-top)' }}>

      {/* ══════════════════════════════════════════════════════════
         HEADER
         ══════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.1)' }}>
        {showingList ? (
          <>
            <button onClick={() => setShowingList(false)}
              className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors">
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <span className="text-[17px] tracking-[0.04em] text-text-primary"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('cart.listTitle')}</span>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-ice-400 hover:bg-charcoal-800 transition-colors"
              style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
              {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
              {copied ? t('cart.copied') : t('cart.copy')}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleClose} className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors">
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[17px] tracking-[0.04em] text-text-primary"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('cart.title')}</span>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px]"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'rgba(0, 229, 255, 0.12)', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                {totalItems}
              </span>
            </div>
            <div className="w-9" />
          </>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════
         EMPTY STATE
         ══════════════════════════════════════════════════════════ */}
      {mergedEntries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
            <ShoppingCart size={32} strokeWidth={1} className="text-text-dim" />
          </div>
          <p className="text-[15px] text-text-muted mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{t('cart.empty')}</p>
          <p className="text-[12px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>{t('cart.emptyHint')}</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         GENERATED LIST VIEW
         ══════════════════════════════════════════════════════════ */}
      {mergedEntries.length > 0 && showingList && (
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
          {/* Today's recipes */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-text-dim"
                style={{ fontFamily: 'var(--font-mono)' }}>{t('clist.recipes')}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0, 229, 255, 0.06)' }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueRecipes.map((rid) => {
                const r = RECIPES.find((x) => x.id === rid)
                if (!r) return null
                return (
                  <span key={rid} className="inline-block px-3 py-1.5 rounded-md text-[12px]"
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 500, color: '#F4F4F4',
                      background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)',
                    }}>
                    {r.nameZh}
                    <span className="text-[10px] text-text-dim ml-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                      {r.nameEn}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-5" style={{ borderTop: '1px solid rgba(0, 229, 255, 0.08)' }} />

          {/* Shopping list */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px] tracking-[0.15em] uppercase text-text-dim"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('clist.shopping')}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0, 229, 255, 0.06)' }} />
          </div>

          <div className="flex flex-col gap-4">
            {mergedEntries.map((entry) => {
              const groups = computeTotals(entry)
              return (
                <div key={entry.nameZh}>
                  {/* Ingredient name */}
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-[15px] text-text-primary"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{entry.nameZh}</span>
                    <span className="text-[11px] text-text-dim">{entry.nameEn}</span>
                  </div>

                  {/* Source lines */}
                  {Array.from(groups.entries()).map(([unitKey, group]) => {
                    const hasTotal = group.totalValue > 0
                    return (
                      <div key={unitKey} className="ml-2">
                        {group.sources.map((src, j) => (
                          <div key={j} className="flex items-center text-[12px] leading-relaxed"
                            style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6' }}>
                            <span className="w-[70px] flex-shrink-0">{src.amount}</span>
                            <span className="text-text-dim">× {src.qty}{t('clist.servings')}</span>
                            {hasTotal && (
                              <span className="ml-2 text-text-dim">
                                = {parseAmount(src.amount)!.value * src.qty}{parseAmount(src.amount)!.unit}
                              </span>
                            )}
                            <span className="ml-2 text-[10px] text-text-dim truncate"
                              style={{ fontFamily: 'var(--font-body)' }}>
                              ({src.recipeName})
                            </span>
                          </div>
                        ))}
                        {/* Total line if multiple sources with same unit */}
                        {group.sources.length > 1 && hasTotal && (
                          <div className="flex items-center mt-0.5 pt-0.5"
                            style={{ borderTop: '1px dashed rgba(0, 229, 255, 0.08)' }}>
                            <span className="text-[12px] text-ice-400"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                               {t('clist.total')}: {group.totalValue}{unitKey}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         CART EDIT VIEW
         ══════════════════════════════════════════════════════════ */}
      {mergedEntries.length > 0 && !showingList && (
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <div className="px-4 py-2.5 rounded-md flex items-center justify-between mb-4"
            style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
            <span className="text-[11px] tracking-[0.12em] uppercase text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
              {uniqueRecipes.length} {t('clist.recipesUnit')} · {mergedEntries.length} {t('clist.itemsUnit')}
            </span>
            <span className="text-[11px] text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>{t('cart.total')} {totalItems} {t('clist.pieces')}</span>
          </div>

          <div className="flex flex-col gap-2">
            {mergedEntries.map((entry) => (
              <div key={entry.nameZh} className="bg-charcoal-900 rounded-md overflow-hidden">
                <div className="flex items-center px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        {entry.nameZh}</span>
                      <span className="text-[11px] text-text-dim">{entry.nameEn}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {entry.sources.map((src, j) => (
                        <span key={src.ingredientId} className="inline-flex items-center gap-1">
                          <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>{src.recipeName}</span>
                          <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#5A6272' }}>{src.amount}{t('clist.perServing')}</span>
                          {j < entry.sources.length - 1 && <span className="text-[9px] text-text-dim mx-0.5">·</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 ml-3">
                    <button onClick={() => handleRemove(entry)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-text-dim hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                      <Minus size={14} strokeWidth={1.5} /></button>
                    <span className="w-10 h-8 flex items-center justify-center text-[15px]"
                      style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00E5FF' }}>{entry.totalQty}</span>
                    <button onClick={() => handleAdd(entry)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-text-dim hover:text-ice-400 hover:bg-charcoal-800 transition-colors">
                      <Plus size={14} strokeWidth={1.5} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         BOTTOM ACTIONS
         ══════════════════════════════════════════════════════════ */}
      {!showingList && (
        <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '1px solid rgba(0, 229, 255, 0.08)' }}>
          <div className="flex gap-3">
            <button onClick={onClear} disabled={mergedEntries.length === 0}
              className="flex-1 py-3 rounded-md text-[13px] tracking-wider uppercase font-medium transition-all duration-200 hover:bg-charcoal-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: '#5A6272', border: '1px solid rgba(138, 148, 166, 0.12)' }}>
              <Trash2 size={14} strokeWidth={1.5} />{t('cart.clear')}
            </button>
            <button onClick={() => setShowingList(true)} disabled={mergedEntries.length === 0}
              className="flex-[2] py-3 rounded-md text-[13px] tracking-wider uppercase font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.08)' }}>
              <Sparkles size={16} strokeWidth={1.5} />{t('cart.generate')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
