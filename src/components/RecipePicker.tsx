import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface RecipePickerProps {
  onSelect: (recipe: Recipe) => void
  onClose: () => void
}

export default function RecipePicker({ onSelect, onClose }: RecipePickerProps) {
  const { t, lang } = useLang()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return RECIPES.slice(0, 20)
    const q = query.trim().toLowerCase()
    return RECIPES.filter((r) =>
      r.nameZh.includes(q) || r.nameEn.toLowerCase().includes(q) ||
      r.tags.some((tag) => tag.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [query])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md max-h-[70vh] flex flex-col rounded-t-2xl sm:rounded-2xl animate-in"
        style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <Search size={16} className="text-text-dim" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search recipes...' : '搜索菜谱...'} autoFocus
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-dim outline-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          <button onClick={onClose} className="text-text-dim hover:text-text-primary"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => onSelect(r)}
              className="text-left px-3 py-2 rounded-md hover:bg-charcoal-800/50 flex items-center gap-3 transition-colors">
              <span className="text-[18px]">{r.emoji}</span>
              <div>
                <span className="text-[13px] text-text-primary block" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {lang === 'en' ? r.nameEn : r.nameZh}
                </span>
                <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                  {lang === 'en' ? r.nameZh : r.nameEn} · ⏱ {r.prepTime}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
