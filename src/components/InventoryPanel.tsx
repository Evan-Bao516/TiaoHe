import { useEffect, useState, useMemo } from 'react'
import { Search, ChevronLeft, Check, Trash2 } from 'lucide-react'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface InventoryPanelProps {
  inventory: Set<string>
  onToggle: (nameZh: string) => void
  onClearAll: () => void
  onClose: () => void
}

/* Build unique ingredient list from all recipes */
function getAllIngredients() {
  const seen = new Set<string>()
  const result: { nameZh: string; nameEn: string; recipes: string[] }[] = []
  for (const recipe of RECIPES) {
    for (const ing of recipe.ingredients) {
      if (seen.has(ing.nameZh)) {
        const existing = result.find((i) => i.nameZh === ing.nameZh)
        if (existing && !existing.recipes.includes(recipe.nameZh)) {
          existing.recipes.push(recipe.nameZh)
        }
      } else {
        seen.add(ing.nameZh)
        result.push({ nameZh: ing.nameZh, nameEn: ing.nameEn, recipes: [recipe.nameZh] })
      }
    }
  }
  return result.sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh'))
}

export default function InventoryPanel({ inventory, onToggle, onClearAll, onClose }: InventoryPanelProps) {
  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  const allIngredients = useMemo(getAllIngredients, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allIngredients
    const q = query.trim().toLowerCase()
    return allIngredients.filter(
      (i) => i.nameZh.includes(q) || i.nameEn.toLowerCase().includes(q) || i.recipes.some((r) => r.includes(q)),
    )
  }, [query, allIngredients])

  const checkedCount = allIngredients.filter((i) => inventory.has(i.nameZh)).length

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-400 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: '#080C13', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.1)' }}>
        <button onClick={handleClose} className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[17px] tracking-[0.04em] text-text-primary"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('inv.title')}</span>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px]"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'rgba(0, 229, 255, 0.12)', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            {checkedCount}/{allIngredients.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checkedCount > 0 && !confirmClear && (
            <button onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] tracking-[0.06em] transition-all duration-200"
              style={{
                fontFamily: 'var(--font-mono)', color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
              }}>
              <Trash2 size={14} strokeWidth={1.5} />{t('inv.clear')}
            </button>
          )}
          {checkedCount > 0 && confirmClear && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>{t('inv.clearConfirm')}</span>
              <button onClick={() => { onClearAll(); setConfirmClear(false) }}
                className="px-2.5 py-1 rounded-md text-[10px] tracking-[0.06em] font-medium transition-all duration-200"
                style={{ fontFamily: 'var(--font-mono)', color: '#F4F4F4', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                {t('inv.clear')}
              </button>
              <button onClick={() => setConfirmClear(false)}
                className="px-2 py-1 rounded text-[10px] text-text-dim hover:text-text-primary"
                style={{ fontFamily: 'var(--font-mono)' }}>✕</button>
            </div>
          )}
          <div className="w-9" />
        </div>
      </header>

      {/* Search */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-md"
          style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
          <Search size={15} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inv.search")}
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-dim outline-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-dim hover:text-text-primary text-[10px]"
              style={{ fontFamily: 'var(--font-mono)' }}>ESC</button>
          )}
        </div>
      </div>

      {/* Empty hint */}
      {allIngredients.length > 0 && checkedCount === 0 && !query && (
        <div className="px-4 pb-3">
          <div className="px-4 py-3 rounded-md text-center"
            style={{ background: 'rgba(0, 229, 255, 0.02)', border: '1px solid rgba(0, 229, 255, 0.04)' }}>
            <p className="text-[12px] text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
              {t('inv.emptyHint')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-4 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#00E5FF' }}>● {checkedCount} {t('inv.have')}</span>
          <span style={{ color: '#5A6272' }}>○ {allIngredients.length - checkedCount} {t('inv.missing')}</span>
        </div>
      </div>

      {/* Ingredient list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-px rounded-md overflow-hidden"
          style={{ border: '1px solid rgba(0, 229, 255, 0.06)' }}>
          {filtered.map((item) => {
            const isChecked = inventory.has(item.nameZh)
            return (
              <button key={item.nameZh} onClick={() => onToggle(item.nameZh)}
                className="flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-charcoal-800/50"
                style={{ background: isChecked ? 'rgba(0, 229, 255, 0.03)' : '#121620' }}>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200`}
                  style={{
                    background: isChecked ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                    border: isChecked ? '1.5px solid rgba(0, 229, 255, 0.4)' : '1.5px solid rgba(138, 148, 166, 0.15)',
                  }}>
                  {isChecked && <Check size={12} strokeWidth={2.5} style={{ color: '#00E5FF' }} />}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-text-primary"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{item.nameZh}</span>
                  <span className="text-[10px] text-text-dim ml-1.5">{item.nameEn}</span>
                </div>

                {/* Recipe count badge */}
                <span className="text-[9px] text-text-dim flex-shrink-0"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {item.recipes.length} {t('inv.recipeCount')}
                </span>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-dim">
            <Search size={24} strokeWidth={1} className="mb-2 opacity-30" />
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-body)' }}>{t('inv.noMatch')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
