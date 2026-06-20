import { useMemo } from 'react'
import { BookOpen, Filter, X } from 'lucide-react'
import type { CookEntry } from '../data/types'
import { useCookJournal } from '../hooks/useCookJournal'
import CookEntryCard from './CookEntryCard'
import { useLang } from '../i18n/context'

interface CookJournalProps {
  onEntryTap?: (entry: CookEntry) => void
}

export default function CookJournal({ onEntryTap }: CookJournalProps) {
  const { t } = useLang()
  const journal = useCookJournal()
  const { entries, monthlyStats, deleteEntry, filter, setFilter, allTags } = journal

  const statsText = useMemo(() => {
    if (monthlyStats.count === 0) return ''
    const h = Math.floor(monthlyStats.totalMinutes / 60)
    const m = monthlyStats.totalMinutes % 60
    return t('journal.monthly')
      .replace('{n}', String(monthlyStats.count))
      .replace('{r}', String(monthlyStats.avgRating))
      .replace('{h}', String(h))
      .replace('{m}', String(m))
  }, [monthlyStats, t])

  const activeTag = filter.tag || ''

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} strokeWidth={1.5} className="text-ice-400" />
          <span className="text-[14px] text-text-primary"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('journal.tab')}</span>
        </div>
        {statsText && (
          <p className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
            {statsText}
          </p>
        )}
      </div>

      {/* Filter bar */}
      {allTags.length > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          <Filter size={10} strokeWidth={1.5} className="text-text-dim flex-shrink-0" />
          {activeTag && (
            <button onClick={() => setFilter({})}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: '#FF2E93', background: 'rgba(255, 46, 147, 0.06)' }}>
              <X size={10} />{t('journal.clearFilter')}
            </button>
          )}
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setFilter({ tag: tag === activeTag ? undefined : tag })}
              className={`px-2 py-0.5 rounded text-[9px] flex-shrink-0 transition-all`}
              style={{
                fontFamily: 'var(--font-body)',
                color: tag === activeTag ? '#F4F4F4' : '#5A6272',
                background: tag === activeTag ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                border: tag === activeTag ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
              }}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <BookOpen size={32} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('journal.empty')}</p>
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('journal.emptyHint')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <CookEntryCard key={entry.id} entry={entry}
                onDelete={(id) => { if (confirm(t('journal.deleteConfirm'))) deleteEntry(id) }}
                onTap={(e) => onEntryTap?.(e)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
