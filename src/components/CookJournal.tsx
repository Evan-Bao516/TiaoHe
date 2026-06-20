import { useMemo, useState } from 'react'
import { BookOpen, Filter, X, Trash2, CheckSquare, Square, Star, Clock } from 'lucide-react'
import type { CookEntry } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useCookJournal } from '../hooks/useCookJournal'
import { useConfirm } from '../hooks/useConfirm'
import CookEntryCard from './CookEntryCard'
import ConfirmDialog from './ConfirmDialog'
import { useLang } from '../i18n/context'

interface CookJournalProps {
  onEntryTap?: (entry: CookEntry) => void
}

export default function CookJournal(_props: CookJournalProps) {
  const { t, lang } = useLang()
  const journal = useCookJournal()
  const confirm = useConfirm()
  const { entries, monthlyStats, deleteEntry, filter, setFilter, allTags } = journal
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailEntry, setDetailEntry] = useState<CookEntry | null>(null)

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    const msg = lang === 'en'
      ? `Delete ${selectedIds.size} entry(s)?`
      : `确定删除选中的 ${selectedIds.size} 条记录？`
    const ok = await confirm.confirm(msg)
    if (!ok) return
    for (const id of selectedIds) deleteEntry(id)
    setSelectedIds(new Set())
    setDeleteMode(false)
  }

  // Detail view — show full entry info
  if (detailEntry) {
    const recipe = RECIPES.find((r) => r.id === detailEntry.recipeId)
    return (
      <div className="flex flex-col min-h-0">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button onClick={() => setDetailEntry(null)} className="text-text-dim hover:text-text-primary">
            <X size={18} />
          </button>
          <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {lang === 'en' ? 'Entry Detail' : '记录详情'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <div className="rounded-lg p-5 mb-4" style={{ background: '#121620', border: '1px solid rgba(0,229,255,0.06)' }}>
            {/* Recipe */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[32px]">{recipe?.emoji}</span>
              <div>
                <p className="text-[16px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {lang === 'en' ? recipe?.nameEn : recipe?.nameZh}
                </p>
                <p className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                  {lang === 'en' ? recipe?.nameZh : recipe?.nameEn}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 rounded" style={{ background: 'rgba(0,229,255,0.03)' }}>
                <div className="flex justify-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} fill={n <= detailEntry.rating ? '#FF9F0A' : 'transparent'}
                      style={{ color: n <= detailEntry.rating ? '#FF9F0A' : '#2A303C' }} />
                  ))}
                </div>
                <span className="text-[9px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>{t('journal.tab')}</span>
              </div>
              <div className="text-center p-3 rounded" style={{ background: 'rgba(0,229,255,0.03)' }}>
                <div className="text-[18px] text-text-primary mb-0.5" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  <Clock size={14} className="inline mr-1" />{detailEntry.actualTime}min
                </div>
                <span className="text-[9px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>{t('journal.tab')}</span>
              </div>
            </div>

            {/* Date */}
            <p className="text-[10px] text-text-dim mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              {new Date(detailEntry.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>

            {/* Tags */}
            {detailEntry.customTags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-3">
                {detailEntry.customTags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px]"
                    style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            {detailEntry.notes && (
              <div className="p-3 rounded mb-3" style={{ background: 'rgba(0,229,255,0.02)', border: '1px solid rgba(0,229,255,0.04)' }}>
                <p className="text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: '#8A94A6' }}>{detailEntry.notes}</p>
              </div>
            )}

            {/* Photo */}
            {detailEntry.photo && (
              <img src={detailEntry.photo} alt="cook" className="w-full max-h-[240px] object-cover rounded-md mb-3" />
            )}

            {/* Completion */}
            <p className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
              {lang === 'en' ? 'Completion' : '完成度'}: {Math.round(detailEntry.completionRatio * 100)}%
            </p>
          </div>

          {/* Delete */}
          <button onClick={async () => { const ok = await confirm.confirm(t('journal.deleteConfirm')); if (ok) { deleteEntry(detailEntry.id); setDetailEntry(null) } }}
            className="w-full py-2.5 rounded text-[11px] hover:brightness-110"
            style={{ fontFamily: 'var(--font-mono)', color: '#FF2E93', background: 'rgba(255,46,147,0.06)', border: '1px solid rgba(255,46,147,0.15)' }}>
            {t('journal.delete')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} strokeWidth={1.5} className="text-ice-400" />
          <span className="text-[14px] text-text-primary"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('journal.tab')}</span>
        </div>
        {entries.length > 0 && (
          <button onClick={() => { setDeleteMode(!deleteMode); setSelectedIds(new Set()) }}
            className={`px-2 py-1 rounded text-[10px] transition-all`}
            style={{
              fontFamily: 'var(--font-mono)',
              color: deleteMode ? '#FF2E93' : '#5A6272',
              background: deleteMode ? 'rgba(255,46,147,0.08)' : 'transparent',
              border: deleteMode ? '1px solid rgba(255,46,147,0.2)' : '1px solid transparent',
            }}>
            <Trash2 size={10} className="inline mr-1" />{t('journal.delete')}
          </button>
        )}
      </div>

      {statsText && (
        <p className="px-4 pb-1 text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          {statsText}
        </p>
      )}

      {/* Delete mode bar */}
      {deleteMode && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <button onClick={toggleSelectAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
            style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6' }}>
            {selectedIds.size === entries.length ? <CheckSquare size={12} /> : <Square size={12} />}
            {lang === 'en' ? 'All' : '全选'}
          </button>
          <div className="flex-1" />
          <button onClick={handleBatchDelete}
            disabled={selectedIds.size === 0}
            className="px-3 py-1 rounded text-[10px] transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              color: selectedIds.size > 0 ? '#FF2E93' : '#2A303C',
              background: selectedIds.size > 0 ? 'rgba(255,46,147,0.08)' : 'transparent',
              border: selectedIds.size > 0 ? '1px solid rgba(255,46,147,0.2)' : '1px solid transparent',
              opacity: selectedIds.size > 0 ? 1 : 0.4,
            }}>
            {lang === 'en' ? `Delete (${selectedIds.size})` : `删除选中 (${selectedIds.size})`}
          </button>
        </div>
      )}

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
            {entries.map((entry) => {
              const isSelected = selectedIds.has(entry.id)
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  {deleteMode && (
                    <button onClick={() => toggleSelect(entry.id)}
                      className="flex-shrink-0 text-text-dim">
                      {isSelected ? <CheckSquare size={18} className="text-[#FF2E93]" /> : <Square size={18} />}
                    </button>
                  )}
                  <div className="flex-1">
                    <CookEntryCard entry={entry}
                      onDelete={async (id) => { const ok = await confirm.confirm(t('journal.deleteConfirm')); if (ok) deleteEntry(id) }}
                      onTap={(e) => deleteMode ? toggleSelect(e.id) : setDetailEntry(e)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {confirm.dialogOpen && (
        <ConfirmDialog message={confirm.dialogMessage} onConfirm={confirm.handleConfirm} onCancel={confirm.handleCancel} />
      )}
    </div>
  )
}
