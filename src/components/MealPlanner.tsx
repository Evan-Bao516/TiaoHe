import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { MealPlan } from '../data/types'
import { RECIPES } from '../data/recipes'
import { useMealPlanner, createPreset } from '../hooks/useMealPlanner'
import PlanDetail from './PlanDetail'
import { useLang } from '../i18n/context'

interface MealPlannerProps {
  onGenerateList: (plan: MealPlan) => void
  onAddToCart: (id: string) => void
}

export default function MealPlanner({ onGenerateList }: MealPlannerProps) {
  const { t, lang } = useLang()
  const { plans, createPlan, deletePlan, updatePlan } = useMealPlanner()
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [showNew, setShowNew] = useState(false)

  const handleGenerateList = (plan: MealPlan) => {
    // Collect all recipe ingredient IDs from the plan
    const ids = new Set<string>()
    for (const day of plan.days) {
      for (const slot of day.slots) {
        if (slot.recipeId) ids.add(slot.recipeId)
      }
    }
    onGenerateList(plan)
  }

  if (selectedPlan) {
    return (
      <PlanDetail
        plan={plans.find((p) => p.id === selectedPlan.id) || selectedPlan}
        onUpdate={(patch) => updatePlan(selectedPlan.id, patch)}
        onBack={() => setSelectedPlan(null)}
        onDelete={() => { if (confirm(t('planner.deleteConfirm'))) { deletePlan(selectedPlan.id); setSelectedPlan(null) } }}
        onGenerateList={() => handleGenerateList(selectedPlan)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          📋 {t('tab.planner')}
        </span>
        <button onClick={() => setShowNew(true)}
          className="px-3 py-1 rounded text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
          {t('planner.newPlan')}
        </button>
      </div>

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
          return (
            <button key={plan.id} onClick={() => setSelectedPlan(plan)}
              className="w-full text-left mb-3 rounded-lg overflow-hidden transition-all hover:brightness-105"
              style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.06)' }}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {plan.name}
                  </span>
                  <ChevronRight size={14} className="text-text-dim" />
                </div>
                <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                  {plan.days.length} {lang === 'en' ? 'days' : '天'} · {totalRecipes} {lang === 'en' ? 'recipes' : '道菜'}
                </span>
                {/* Day preview */}
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
          )
        })}
      </div>

      {/* New plan modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-in"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <h3 className="text-[14px] text-text-primary mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {lang === 'en' ? 'New Meal Plan' : '新建餐食计划'}
            </h3>
            {[
              { key: 'week' as const, label: t('planner.presetWeek'), desc: lang === 'en' ? '7 days · Lunch + Dinner' : '7天 · 午餐+晚餐' },
              { key: '3day' as const, label: t('planner.preset3Day'), desc: lang === 'en' ? '3 days · Breakfast+Lunch+Dinner' : '3天 · 早中晚三餐' },
              { key: 'blank' as const, label: t('planner.presetBlank'), desc: '' },
            ].map(({ key, label, desc }) => (
              <button key={key} onClick={() => { createPlan(createPreset(key, lang)); setShowNew(false) }}
                className="w-full text-left px-4 py-3 mb-2 rounded-md hover:bg-charcoal-800/50 transition-colors"
                style={{ border: '1px solid rgba(0, 229, 255, 0.06)' }}>
                <span className="text-[13px] text-text-primary block" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{label}</span>
                {desc && <span className="text-[10px] text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>{desc}</span>}
              </button>
            ))}
            <button onClick={() => setShowNew(false)}
              className="w-full mt-2 py-2 text-[11px] text-text-dim hover:text-text-primary"
              style={{ fontFamily: 'var(--font-mono)' }}>{lang === 'en' ? 'Cancel' : '取消'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
