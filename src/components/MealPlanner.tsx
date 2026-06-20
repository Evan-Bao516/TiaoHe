import { useState, useCallback } from 'react'
import { ChevronRight, Minus, Plus, Trash2, CheckSquare, Square } from 'lucide-react'
import type { MealPlan, MealDay } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useMealPlanner } from '../hooks/useMealPlanner'
import PlanDetail from './PlanDetail'
import { useLang } from '../i18n/context'

interface MealPlannerProps {
  onGenerateList: (plan: MealPlan) => void
  onAddToCart: (id: string) => void
}

const DEFAULT_SLOT_NAMES = ['早餐', '午餐', '晚餐']

function makeId(): string { return crypto.randomUUID() }

export default function MealPlanner({ onGenerateList }: MealPlannerProps) {
  const { t, lang } = useLang()
  const { plans, createPlan, deletePlan, updatePlan } = useMealPlanner()
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // New plan config
  const [newDays, setNewDays] = useState(7)
  const [newMealsPerDay, setNewMealsPerDay] = useState(2)

  const handleGenerateList = useCallback((plan: MealPlan) => {
    onGenerateList(plan)
  }, [onGenerateList])

  const handleCreatePlan = () => {
    const now = Date.now()
    const slotNames = DEFAULT_SLOT_NAMES.slice(0, newMealsPerDay)
    const days: MealDay[] = Array.from({ length: newDays }, (_, i) => ({
      id: makeId(),
      label: `${lang === 'en' ? 'Day' : '第'}${i + 1}${lang === 'en' ? '' : '天'}`,
      slots: slotNames.map((name) => ({ id: makeId(), name, recipeId: null })),
    }))
    createPlan({
      id: makeId(),
      name: lang === 'en' ? 'New Plan' : '新计划',
      createdAt: now,
      days,
    })
    setShowNew(false)
    setNewDays(7)
    setNewMealsPerDay(2)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === plans.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(plans.map((p) => p.id)))
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(lang === 'en'
      ? `Delete ${selectedIds.size} plan(s)?`
      : `确定删除选中的 ${selectedIds.size} 个计划？`
    )) return
    for (const id of selectedIds) deletePlan(id)
    setSelectedIds(new Set())
    setDeleteMode(false)
  }

  if (selectedPlan) {
    const current = plans.find((p) => p.id === selectedPlan.id) || selectedPlan
    return (
      <PlanDetail
        plan={current}
        onUpdate={(patch) => updatePlan(selectedPlan.id, patch)}
        onBack={() => setSelectedPlan(null)}
        onDelete={() => { if (confirm(t('planner.deleteConfirm'))) { deletePlan(selectedPlan.id); setSelectedPlan(null) } }}
        onGenerateList={() => handleGenerateList(current)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          📋 {t('tab.planner')}
        </span>
        <div className="flex items-center gap-2">
          {plans.length > 0 && (
            <button onClick={() => { setDeleteMode(!deleteMode); setSelectedIds(new Set()) }}
              className={`px-2 py-1 rounded text-[10px] transition-all`}
              style={{
                fontFamily: 'var(--font-mono)',
                color: deleteMode ? '#FF2E93' : '#5A6272',
                background: deleteMode ? 'rgba(255,46,147,0.08)' : 'transparent',
                border: deleteMode ? '1px solid rgba(255,46,147,0.2)' : '1px solid transparent',
              }}>
              <Trash2 size={10} className="inline mr-1" />{t('planner.delete')}
            </button>
          )}
          <button onClick={() => setShowNew(true)}
            className="px-3 py-1 rounded text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
            {t('planner.newPlan')}
          </button>
        </div>
      </div>

      {/* Delete mode bar */}
      {deleteMode && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <button onClick={toggleSelectAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
            style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6' }}>
            {selectedIds.size === plans.length ? <CheckSquare size={12} /> : <Square size={12} />}
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

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <span className="text-[32px] mb-3 opacity-30">📋</span>
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-display)' }}>{t('planner.empty')}</p>
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-body)' }}>{t('planner.emptyHint')}</p>
            <button onClick={() => setShowNew(true)}
              className="mt-4 px-4 py-2 rounded text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
              {t('planner.newPlan')}
            </button>
          </div>
        )}

        {plans.map((plan) => {
          const totalRecipes = plan.days.reduce((s, d) => s + d.slots.filter((sl) => sl.recipeId).length, 0)
          const isSelected = selectedIds.has(plan.id)
          return (
            <div key={plan.id} className="flex items-center gap-2 mb-3">
              {deleteMode && (
                <button onClick={() => toggleSelect(plan.id)}
                  className="flex-shrink-0 text-text-dim">
                  {isSelected ? <CheckSquare size={18} className="text-[#FF2E93]" /> : <Square size={18} />}
                </button>
              )}
              <button onClick={() => deleteMode ? toggleSelect(plan.id) : setSelectedPlan(plan)}
                className="flex-1 text-left rounded-lg overflow-hidden transition-all hover:brightness-105"
                style={{ background: '#121620', border: isSelected ? '1px solid rgba(255,46,147,0.25)' : '1px solid rgba(0, 229, 255, 0.06)' }}>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {plan.name}
                    </span>
                    {!deleteMode && <ChevronRight size={14} className="text-text-dim" />}
                  </div>
                  <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                    {plan.days.length} {lang === 'en' ? 'days' : '天'} · {plan.days[0]?.slots.length || 0} {lang === 'en' ? 'meals/day' : '餐/天'} · {totalRecipes} {lang === 'en' ? 'recipes' : '道菜'}
                  </span>
                  {plan.days.slice(0, 3).map((day) => (
                    <div key={day.id} className="mt-2 flex gap-1 flex-wrap items-center">
                      <span className="text-[9px] text-text-dim mr-1" style={{ fontFamily: 'var(--font-mono)' }}>{day.label}</span>
                      {day.slots.filter((s) => s.recipeId).slice(0, 3).map((slot) => {
                        const r = RECIPES.find((x) => x.id === slot.recipeId)
                        return r ? (
                          <span key={slot.id} className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.06)' }}>
                            {r.emoji} {lang === 'en' ? r.nameEn : r.nameZh}
                          </span>
                        ) : null
                      })}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* New plan modal — configurator */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-in"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <h3 className="text-[14px] text-text-primary mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {lang === 'en' ? 'New Meal Plan' : '新建餐食计划'}
            </h3>

            {/* Days picker */}
            <div className="mb-4">
              <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
                style={{ fontFamily: 'var(--font-mono)' }}>
                {lang === 'en' ? 'Days' : '天数'} · {newDays}
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setNewDays((d) => Math.max(1, d - 1))}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-charcoal-800/50"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                  <Minus size={16} className="text-text-dim" />
                </button>
                <div className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0, 229, 255, 0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${(newDays / 14) * 100}%`, background: '#00E5FF', opacity: 0.5 }} />
                </div>
                <button onClick={() => setNewDays((d) => Math.min(14, d + 1))}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-charcoal-800/50"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                  <Plus size={16} className="text-text-dim" />
                </button>
              </div>
            </div>

            {/* Meals per day picker */}
            <div className="mb-4">
              <label className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2 block"
                style={{ fontFamily: 'var(--font-mono)' }}>
                {lang === 'en' ? 'Meals per Day' : '每日餐次'} · {newMealsPerDay}
              </label>
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setNewMealsPerDay((m) => Math.max(1, m - 1))}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-charcoal-800/50"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                  <Minus size={16} className="text-text-dim" />
                </button>
                <div className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0, 229, 255, 0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${(newMealsPerDay / 5) * 100}%`, background: '#00E5FF', opacity: 0.5 }} />
                </div>
                <button onClick={() => setNewMealsPerDay((m) => Math.min(5, m + 1))}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-charcoal-800/50"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                  <Plus size={16} className="text-text-dim" />
                </button>
              </div>
              {/* Slot name preview */}
              <div className="flex gap-1 flex-wrap">
                {DEFAULT_SLOT_NAMES.slice(0, newMealsPerDay).map((name) => (
                  <span key={name} className="px-2 py-0.5 rounded text-[9px]"
                    style={{ fontFamily: 'var(--font-body)', color: '#8A94A6', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)' }}>
                    {name}
                  </span>
                ))}
                {newMealsPerDay > DEFAULT_SLOT_NAMES.length && (
                  <span className="px-2 py-0.5 rounded text-[9px]"
                    style={{ fontFamily: 'var(--font-body)', color: '#5A6272', background: 'rgba(138,148,166,0.04)', border: '1px dashed rgba(138,148,166,0.15)' }}>
                    {lang === 'en' ? 'Custom' : '自定义'}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 rounded-md text-[11px] transition-colors"
                style={{ fontFamily: 'var(--font-mono)', color: '#8A94A6', border: '1px solid rgba(138,148,166,0.15)' }}>
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button onClick={handleCreatePlan}
                className="flex-[2] py-2.5 rounded-md text-[12px] font-semibold transition-all hover:brightness-110"
                style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
                {lang === 'en' ? 'Create Plan' : '创建计划'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
