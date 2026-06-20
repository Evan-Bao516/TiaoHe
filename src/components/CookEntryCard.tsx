import { Star, Clock, Trash2 } from 'lucide-react'
import type { CookEntry } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useLang } from '../i18n/context'

interface CookEntryCardProps {
  entry: CookEntry
  onDelete: (id: string) => void
  onTap: (entry: CookEntry) => void
}

function formatDate(ts: number, t: (k: string) => string): string {
  const now = new Date()
  const date = new Date(ts)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))
  if (diffDays < 0) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }
  if (diffDays === 0) return t('journal.today')
  if (diffDays === 1) return t('journal.yesterday')
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

export default function CookEntryCard({ entry, onDelete, onTap }: CookEntryCardProps) {
  const { t, lang } = useLang()
  const recipe = RECIPES.find((r) => r.id === entry.recipeId)
  if (!recipe) return null

  return (
    <div onClick={() => onTap(entry)}
      className="rounded-lg overflow-hidden transition-all duration-200 hover:brightness-105 cursor-pointer relative group"
      style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>

      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: recipe.accent, opacity: 0.6 }} />

      <div className="pl-4 pr-4 py-4">
        {/* Top row: recipe + date + delete */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">{recipe.emoji}</span>
            <div>
              <span className="text-[13px] text-text-primary block"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {lang === 'en' ? recipe.nameEn : recipe.nameZh}
              </span>
              <span className="text-[9px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                {lang === 'en' ? recipe.nameZh : recipe.nameEn}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatDate(entry.date, t)}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
              className="text-text-dim hover:text-[#FF2E93] transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Rating + time */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={12} strokeWidth={1.5}
                fill={n <= entry.rating ? '#FF9F0A' : 'transparent'}
                style={{ color: n <= entry.rating ? '#FF9F0A' : '#2A303C' }} />
            ))}
          </div>
          <span className="text-[10px] text-text-dim flex items-center gap-1"
            style={{ fontFamily: 'var(--font-mono)' }}>
            <Clock size={10} />{entry.actualTime}min
          </span>
        </div>

        {/* Tags */}
        {entry.customTags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {entry.customTags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px]"
                style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes excerpt */}
        {entry.notes && (
          <p className="text-[11px] leading-relaxed line-clamp-2"
            style={{ fontFamily: 'var(--font-body)', color: '#5A6272' }}>
            {entry.notes}
          </p>
        )}

        {/* Photo thumbnail */}
        {entry.photo && (
          <img src={entry.photo} alt="cook" className="mt-2 max-h-[80px] rounded-md opacity-80" />
        )}
      </div>
    </div>
  )
}
