import { useState } from 'react'
import { ArrowLeft, Plus, X, Search } from 'lucide-react'
import type { MealPlan, MealDay, MealSlot, Recipe } from '../data/types'
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

  const addDay = () => {
    const newDay: MealDay = {
      id: makeId(),
      label: `${lang === 'en' ? 'Day' : '第'}${plan.days.length + 1}${lang === 'en' ? '' : '天'}`,
      slots: [{ id: makeId(), name: lang === 'en' ? 'Lunch' : '午餐', recipeId: null }],
    }
    onUpdate({ days: [...plan.days, newDay] })
  }

  const addSlot = (dayId: string) => {
    const name = newSlotName.trim() || (lang === 'en' ? 'Meal' : '餐次')
    const newSlot: MealSlot = { id: makeId(), name, recipeId: null }
    onUpdate({
      days: plan.days.map((d) => d.id === dayId ? { ...d, slots: [...d.slots, newSlot] } : d),
    })
    setNewSlotName('')
  }

  const removeSlot = (dayId: string, slotId: string) => {
    onUpdate({
      days: plan.days.map((d) => d.id === dayId ? { ...d, slots: d.slots.filter((s) => s.id !== slotId) } : d),
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

  const removeDay = (dayId: string) => {
    onUpdate({ days: plan.days.filter((d) => d.id !== dayId) })
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="text-text-dim hover:text-text-primary"><ArrowLeft size={18} /></button>
        <h2 className="text-[16px] text-text-primary flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {plan.name}
        </h2>
        <button onClick={onDelete}
          className="text-[10px] text-text-dim hover:text-[#FF2E93]" style={{ fontFamily: 'var(--font-mono)' }}>
          {t('planner.delete')}
        </button>
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
                <span className="text-[12px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {day.label} · {recipeCount} {lang === 'en' ? 'recipes' : '道菜'}
                </span>
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
                    <span className="text-[10px] text-text-dim w-12 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                      {slot.name}
                    </span>
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

              {/* Remove last slot button (only if more than 1 slot) */}
              {day.slots.length > 1 && (
                <div className="px-3 py-1 flex justify-end">
                  <button onClick={() => removeSlot(day.id, day.slots[day.slots.length - 1].id)}
                    className="text-[9px] text-text-dim hover:text-[#FF2E93]"
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    <X size={10} className="inline mr-1" />{lang === 'en' ? 'Remove last' : '移除末餐次'}
                  </button>
                </div>
              )}

              {/* Add slot */}
              <div className="px-3 py-2 flex items-center gap-2">
                <input value={newSlotName} onChange={(e) => setNewSlotName(e.target.value)}
                  placeholder={lang === 'en' ? 'Slot name' : '餐次名称'}
                  className="flex-1 bg-transparent text-[11px] text-text-primary placeholder:text-text-dim outline-none"
                  style={{ fontFamily: 'var(--font-body)' }} />
                <button onClick={() => addSlot(day.id)}
                  className="text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  {t('planner.addSlot')}
                </button>
              </div>
            </div>
          )
        })}

        {/* Add day */}
        <button onClick={addDay}
          className="w-full py-3 rounded-md text-[11px] transition-colors hover:bg-charcoal-800/30"
          style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', border: '1px dashed rgba(0, 229, 255, 0.12)' }}>
          {t('planner.addDay')}
        </button>

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
