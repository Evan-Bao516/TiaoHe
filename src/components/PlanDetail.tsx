import { useState } from 'react'
import { ArrowLeft, X, Search, Edit3, Check } from 'lucide-react'
import type { MealPlan, MealDay, Recipe } from '../data/types'
import { RECIPES } from '../data/recipes'
import RecipePicker from './RecipePicker'
import { useLang } from '../i18n/context'

interface PlanDetailProps {
  plan: MealPlan
  onUpdate: (patch: Partial<MealPlan>) => void
  onBack: () => void
  onDelete: () => void
  onGenerateList: () => void
}

function makeId(): string {
  return crypto.randomUUID()
}

export default function PlanDetail({ plan, onUpdate, onBack, onDelete, onGenerateList }: PlanDetailProps) {
  const { t, lang } = useLang()
  const [pickerFor, setPickerFor] = useState<{ dayId: string; slotId: string } | null>(null)
  const [newSlotName, setNewSlotName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(plan.name)

  const mealsPerDay = plan.days[0]?.slots.length || 0

  const addDay = () => {
    const template = plan.days[0]
    const slotNames = template ? template.slots.map((s) => s.name) : [lang === 'en' ? 'Lunch' : '午餐']
    const newDay: MealDay = {
      id: makeId(),
      label: `${lang === 'en' ? 'Day' : '第'}${plan.days.length + 1}${lang === 'en' ? '' : '天'}`,
      slots: slotNames.map((name) => ({ id: makeId(), name, recipeId: null })),
    }
    onUpdate({ days: [...plan.days, newDay] })
  }

  const removeDay = (dayId: string) => {
    onUpdate({ days: plan.days.filter((d) => d.id !== dayId) })
  }

  const addSlotToAll = () => {
    const name = newSlotName.trim() || (lang === 'en' ? 'Meal' : '餐次')
    onUpdate({
      days: plan.days.map((d) => ({
        ...d,
        slots: [...d.slots, { id: makeId(), name, recipeId: null }],
      })),
    })
    setNewSlotName('')
  }

  const removeSlotFromAll = (slotIndex: number) => {
    onUpdate({
      days: plan.days.map((d) => ({
        ...d,
        slots: d.slots.filter((_, i) => i !== slotIndex),
      })),
    })
  }

  const clearSlot = (dayId: string, slotId: string) => {
    onUpdate({
      days: plan.days.map((d) =>
        d.id === dayId
          ? { ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, recipeId: null } : s) }
          : d
      ),
    })
  }

  const assignRecipe = (dayId: string, slotId: string, recipe: Recipe) => {
    onUpdate({
      days: plan.days.map((d) =>
        d.id === dayId
          ? { ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, recipeId: recipe.id } : s) }
          : d
      ),
    })
    setPickerFor(null)
  }

  const updateDayLabel = (dayId: string, label: string) => {
    onUpdate({
      days: plan.days.map((d) => d.id === dayId ? { ...d, label } : d),
    })
  }

  const updateSlotName = (dayId: string, slotId: string, name: string) => {
    onUpdate({
      days: plan.days.map((d) =>
        d.id === dayId
          ? { ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, name } : s) }
          : d
      ),
    })
  }

  const totalRecipes = plan.days.reduce((s, d) => s + d.slots.filter((sl) => sl.recipeId).length, 0)

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="text-text-dim hover:text-text-primary"><ArrowLeft size={18} /></button>

        {editingName ? (
          <div className="flex-1 flex items-center gap-2">
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onUpdate({ name: nameDraft }); setEditingName(false) }
                if (e.key === 'Escape') { setNameDraft(plan.name); setEditingName(false) }
              }}
              className="flex-1 bg-transparent text-[16px] text-text-primary outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, borderBottom: '1px solid rgba(0,229,255,0.3)' }} />
            <button onClick={() => { onUpdate({ name: nameDraft }); setEditingName(false) }}
              className="text-[#10B981]"><Check size={16} /></button>
            <button onClick={() => { setNameDraft(plan.name); setEditingName(false) }}
              className="text-text-dim"><X size={16} /></button>
          </div>
        ) : (
          <>
            <h2 className="text-[16px] text-text-primary flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {plan.name}
            </h2>
            <button onClick={() => { setNameDraft(plan.name); setEditingName(true) }}
              className="text-text-dim hover:text-text-primary"><Edit3 size={12} /></button>
          </>
        )}

        <button onClick={onDelete}
          className="text-[10px] text-text-dim hover:text-[#FF2E93]" style={{ fontFamily: 'var(--font-mono)' }}>
          {t('planner.delete')}
        </button>
      </div>

      {/* Config summary + controls */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6' }}>
        <span>{plan.days.length} {lang === 'en' ? 'days' : '天'} · {mealsPerDay} {lang === 'en' ? 'meals/day' : '餐/天'} · {totalRecipes} {lang === 'en' ? 'recipes' : '道菜'}</span>
        <div className="flex items-center gap-1">
          <button onClick={addDay}
            className="text-[9px] px-1.5 py-0.5 rounded text-[#00E5FF]"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            +{lang === 'en' ? 'Day' : '天'}
          </button>
          <button onClick={addSlotToAll}
            className="text-[9px] px-1.5 py-0.5 rounded text-[#00E5FF]"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            +{lang === 'en' ? 'Meal' : '餐'}
          </button>
          {mealsPerDay > 1 && (
            <button onClick={() => removeSlotFromAll(mealsPerDay - 1)}
              className="text-[9px] px-1.5 py-0.5 rounded text-[#FF2E93]"
              style={{ background: 'rgba(255,46,147,0.04)', border: '1px solid rgba(255,46,147,0.1)' }}>
              -{lang === 'en' ? 'Meal' : '餐'}
            </button>
          )}
        </div>
      </div>

      {/* Days */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {plan.days.map((day) => {
          const recipeCount = day.slots.filter((s) => s.recipeId).length
          return (
            <div key={day.id} className="mb-3 rounded-lg overflow-hidden"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
              {/* Day header */}
              <div className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.04)' }}>
                <div className="flex items-center gap-2">
                  <input value={day.label} onChange={(e) => updateDayLabel(day.id, e.target.value)}
                    className="w-16 bg-transparent text-[12px] text-text-primary outline-none"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }} />
                  <span className="text-[9px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                    · {recipeCount} {lang === 'en' ? 'recipes' : '道菜'}
                  </span>
                </div>
                <button onClick={() => removeDay(day.id)}
                  className="text-[10px] text-text-dim hover:text-[#FF2E93]" style={{ fontFamily: 'var(--font-mono)' }}>
                  <X size={12} />
                </button>
              </div>

              {/* Slots */}
              {day.slots.map((slot) => {
                const recipe = slot.recipeId ? RECIPES.find((r) => r.id === slot.recipeId) : null
                return (
                  <div key={slot.id} className="flex items-center gap-2 px-3 py-2"
                    style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.02)' }}>
                    <input value={slot.name} onChange={(e) => updateSlotName(day.id, slot.id, e.target.value)}
                      className="text-[10px] text-text-dim w-12 flex-shrink-0 bg-transparent outline-none"
                      style={{ fontFamily: 'var(--font-mono)' }} />
                    {recipe ? (
                      <>
                        <span className="text-[18px]">{recipe.emoji}</span>
                        <span className="text-[12px] text-text-primary flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {lang === 'en' ? recipe.nameEn : recipe.nameZh}
                        </span>
                        <button onClick={() => clearSlot(day.id, slot.id)}
                          className="text-text-dim hover:text-[#FF2E93]">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setPickerFor({ dayId: day.id, slotId: slot.id })}
                        className="flex-1 text-left px-2 py-1 rounded text-[11px] text-text-dim hover:text-text-primary transition-colors"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        <Search size={10} className="inline mr-1" />{t('planner.emptySlot')}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {plan.days.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-dim">
            <p className="text-[13px]" style={{ fontFamily: 'var(--font-display)' }}>
              {lang === 'en' ? 'No days yet' : '还没有添加天'}
            </p>
          </div>
        )}

        {/* Add day */}
        <button onClick={addDay}
          className="w-full py-3 rounded-md text-[11px] transition-colors hover:bg-charcoal-800/30"
          style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', border: '1px dashed rgba(0, 229, 255, 0.12)' }}>
          {t('planner.addDay')}
        </button>

        {/* Slot name input for adding */}
        {plan.days.length > 0 && (
          <div className="px-3 py-2 mt-2 flex items-center gap-2 rounded-md"
            style={{ border: '1px dashed rgba(0, 229, 255, 0.08)' }}>
            <input value={newSlotName} onChange={(e) => setNewSlotName(e.target.value)}
              placeholder={lang === 'en' ? 'Slot name' : '餐次名称'}
              className="flex-1 bg-transparent text-[11px] text-text-primary placeholder:text-text-dim outline-none"
              style={{ fontFamily: 'var(--font-body)' }} />
            <button onClick={addSlotToAll}
              className="text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
              {t('planner.addSlot')}
            </button>
          </div>
        )}

        {/* Generate list */}
        <button onClick={onGenerateList}
          className="w-full mt-4 py-3 rounded-md text-[12px] font-semibold transition-all hover:brightness-110"
          style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
          🛒 {t('planner.generateList')}
        </button>
      </div>

      {/* RecipePicker modal */}
      {pickerFor && (
        <RecipePicker
          onSelect={(recipe) => assignRecipe(pickerFor.dayId, pickerFor.slotId, recipe)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  )
}
