import { useState } from 'react'
import { X, Camera, Star } from 'lucide-react'
import type { Recipe, CookEntry } from '../data/types'
import { useLang } from '../i18n/context'

interface CookEntryFormProps {
  recipe: Recipe
  completionRatio: number
  existingTags: string[]
  onSubmit: (data: Omit<CookEntry, 'id'>) => void
  onCancel: () => void
}

export default function CookEntryForm({ recipe, completionRatio, existingTags, onSubmit, onCancel }: CookEntryFormProps) {
  const { t, lang } = useLang()
  const [rating, setRating] = useState(0)

  function parsePrepTimeMinutes(duration: string): number {
    const hourMatch = duration.match(/(\d+)\s*h/)
    const minMatch = duration.match(/(\d+)\s*min/)
    let total = 0
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60
    if (minMatch) total += parseInt(minMatch[1], 10)
    if (total === 0) total = parseInt(duration, 10) || 0
    return total
  }

  const [actualTime, setActualTime] = useState(parsePrepTimeMinutes(recipe.prepTime))
  const [notes, setNotes] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()

  const handlePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        alert(t('entry.photoSizeLimit'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    onSubmit({
      recipeId: recipe.id,
      date: Date.now(),
      rating: rating || 3,
      notes,
      photo,
      actualTime,
      customTags,
      completionRatio,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-in"
        style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)', boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <div className="flex items-center gap-3">
            <span className="text-[20px]">{recipe.emoji}</span>
            <div>
              <h3 className="text-[15px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {t('entry.title')}
              </h3>
              <p className="text-[11px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
                {lang === 'en' ? recipe.nameEn : recipe.nameZh}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-text-dim hover:text-text-primary">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Rating */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.rating')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}
                  className="text-[24px] transition-colors duration-150"
                  style={{ color: n <= rating ? '#FF9F0A' : '#2A303C' }}>
                  <Star size={28} strokeWidth={1.5} fill={n <= rating ? '#FF9F0A' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          {/* Actual time */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.actualTime')}</label>
            <input type="number" value={actualTime} onChange={(e) => setActualTime(Number(e.target.value))}
              min={0} className="w-full bg-transparent text-[14px] text-text-primary px-3 py-2 rounded-md"
              style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={t('entry.notesPlaceholder')}
              className="w-full bg-transparent text-[13px] text-text-primary px-3 py-2 rounded-md resize-none placeholder:text-text-dim"
              style={{ fontFamily: 'var(--font-body)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
              style={{ fontFamily: 'var(--font-mono)' }}>{t('entry.tags')}</label>
            <div className="flex items-center gap-2 mb-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('entry.tagPlaceholder')}
                className="flex-1 bg-transparent text-[13px] text-text-primary px-3 py-1.5 rounded-md placeholder:text-text-dim"
                style={{ fontFamily: 'var(--font-body)', border: '1px solid rgba(0, 229, 255, 0.12)' }} />
              <button onClick={handleAddTag}
                className="px-3 py-1.5 rounded text-[11px]"
                style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                +
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {customTags.map((tag) => (
                <span key={tag} onClick={() => handleRemoveTag(tag)}
                  className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ fontFamily: 'var(--font-body)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.18)' }}>
                  {tag} ×
                </span>
              ))}
              {/* Tag suggestions from history */}
              {existingTags.filter((t) => !customTags.includes(t)).slice(0, 5).map((tag) => (
                <span key={tag} onClick={() => setCustomTags((prev) => [...prev, tag])}
                  className="px-2 py-0.5 rounded text-[10px] cursor-pointer hover:brightness-110 transition-all"
                  style={{ fontFamily: 'var(--font-body)', color: '#5A6272', background: 'rgba(138, 148, 166, 0.06)', border: '1px solid rgba(138, 148, 166, 0.1)' }}>
                  + {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <button onClick={handlePhoto}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] transition-colors hover:brightness-110"
              style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6', border: '1px dashed rgba(138, 148, 166, 0.2)' }}>
              <Camera size={14} />
              {photo ? t('entry.changePhoto') : t('entry.photo')}
            </button>
            {photo && (
              <div className="relative mt-2 inline-block">
                <img src={photo} alt="cook photo" className="max-h-[120px] rounded-md" />
                <button onClick={() => setPhoto(undefined)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#F4F4F4' }}>
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3"
          style={{ borderTop: '1px solid rgba(0, 229, 255, 0.06)' }}>
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-md text-[12px] transition-colors"
            style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
            {t('entry.cancel')}
          </button>
          <button onClick={handleSubmit}
            className="flex-[2] py-2.5 rounded-md text-[12px] font-semibold transition-all hover:brightness-110"
            style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
            {t('entry.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
