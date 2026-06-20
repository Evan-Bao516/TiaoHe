import { useMemo, useState } from 'react'
import { BarChart3, ChefHat, ChevronDown, ChevronUp, Clock, Flame, Star } from 'lucide-react'
import { useLang } from '../i18n/context'
import { useNutritionStats } from '../hooks/useNutritionStats'
import { KcalLineChart, MacrosBarChart, CuisineDonut } from './NutritionCharts'
import { RECIPES } from '../data/recipes'

/* ── Design constants (matches Cyberpunk Bauhaus dark theme) ────── */

const CYAN = '#00E5FF'
const BG_CARD = '#121620'

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Format minutes → "Xh Ym" or "Xm" */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/* ═══════════════════════════════════════════════════════════════════
   NutritionDashboard — full dashboard view
   ═══════════════════════════════════════════════════════════════════ */

export default function NutritionDashboard() {
  const { t, lang } = useLang()

  /* ── Date range state (default: 1st of current month → today) ── */
  const [dateStart, setDateStart] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })
  const [dateEnd, setDateEnd] = useState(() => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d.getTime()
  })

  const [detailExpanded, setDetailExpanded] = useState(false)

  /* ── Data ───────────────────────────────────────────────────── */
  const stats = useNutritionStats(dateStart, dateEnd)
  const recipeMap = useMemo(() => new Map(RECIPES.map((r) => [r.id, r])), [])

  /* ── Date <-> input helpers ──────────────────────────────────── */
  const dateToInput = (ms: number) => {
    const d = new Date(ms)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const inputToDateStart = (val: string) => new Date(val + 'T00:00:00').getTime()
  const inputToDateEnd = (val: string) => new Date(val + 'T23:59:59').getTime()

  /* ── Derived ────────────────────────────────────────────────── */
  const maxTagCount =
    stats.tagDistribution.length > 0
      ? Math.max(...stats.tagDistribution.map((tg) => tg.count))
      : 1

  const isEmpty = stats.totalCookCount === 0

  /* ── Stat card data ─────────────────────────────────────────── */
  const statCards = useMemo(
    () =>
      [
        { icon: ChefHat, label: t('nutri.totalCooks'), value: String(stats.totalCookCount) },
        { icon: Star, label: t('nutri.avgRating'), value: `${stats.avgRating}★` },
        { icon: Clock, label: t('nutri.totalMinutes'), value: formatTime(stats.totalMinutes) },
      ] as const,
    [stats.totalCookCount, stats.avgRating, stats.totalMinutes, t],
  )

  /* ================================================================
     Render
     ================================================================ */

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="pt-4 pb-3 flex items-center gap-2">
          <BarChart3 size={16} strokeWidth={1.5} className="text-ice-400" />
          <span
            className="text-[14px] text-text-primary"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            {t('nutri.title')}
          </span>
        </div>

        {/* ── Date range picker ──────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="date"
            value={dateToInput(dateStart)}
            onChange={(e) => setDateStart(inputToDateStart(e.target.value))}
            className="flex-1 text-[11px]"
            style={{
              background: BG_CARD,
              border: '1px solid rgba(0, 229, 255, 0.1)',
              borderRadius: 6,
              color: '#F4F4F4',
              fontFamily: 'var(--font-mono)',
              padding: '6px 8px',
            }}
          />
          <span className="text-text-dim text-[11px]">~</span>
          <input
            type="date"
            value={dateToInput(dateEnd)}
            onChange={(e) => setDateEnd(inputToDateEnd(e.target.value))}
            className="flex-1 text-[11px]"
            style={{
              background: BG_CARD,
              border: '1px solid rgba(0, 229, 255, 0.1)',
              borderRadius: 6,
              color: '#F4F4F4',
              fontFamily: 'var(--font-mono)',
              padding: '6px 8px',
            }}
          />
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        {isEmpty ? (
          /* ══════════ Empty state ════════════════════════════════ */
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Flame size={40} strokeWidth={1} className="mb-3 opacity-20" />
            <p
              className="text-[14px] text-text-muted"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('nutri.empty')}
            </p>
            <p className="text-[11px] mt-1">{t('nutri.emptyHint')}</p>
          </div>
        ) : (
          <>
            {/* ══════════ Hero kcal stat ════════════════════════════ */}
            <div
              className="bg-charcoal-900 rounded p-5 mb-3 text-center animate-in"
              style={{ border: '1px solid rgba(0, 229, 255, 0.06)' }}
            >
              <div
                className="text-[42px] leading-none text-text-primary mb-1"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
              >
                {stats.totalKcal.toLocaleString()}
              </div>
              <div
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: CYAN, opacity: 0.7 }}
              >
                kcal
              </div>
              <div
                className="text-[10px] text-text-dim mt-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t('nutri.avgKcalPerDay')}: {stats.avgKcalPerDay.toLocaleString()} kcal
              </div>
            </div>

            {/* ══════════ Stat cards row ════════════════════════════ */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {statCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div
                    key={i}
                    className="bg-charcoal-900 rounded p-3 text-center animate-in"
                    style={{
                      animationDelay: `${i * 60}ms`,
                      border: '1px solid rgba(0, 229, 255, 0.04)',
                    }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-ice-400 mx-auto mb-1.5" />
                    <div
                      className="text-[16px] text-text-primary leading-none mb-0.5"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      {card.value}
                    </div>
                    <div
                      className="text-[9px] text-text-dim uppercase tracking-[0.1em]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {card.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ══════════ Kcal line chart ════════════════════════════ */}
            <div
              className="bg-charcoal-900 rounded p-3 mb-3 animate-in"
              style={{ animationDelay: '120ms', border: '1px solid rgba(0, 229, 255, 0.04)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                {/* spacer — accent line */}
                <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
                <span
                  className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('nutri.kcalTrend')}
                </span>
              </div>
              <KcalLineChart data={stats.kcalTrend} />
            </div>

            {/* ══════════ Macros bar chart ══════════════════════════ */}
            <div
              className="bg-charcoal-900 rounded p-3 mb-3 animate-in"
              style={{ animationDelay: '180ms', border: '1px solid rgba(0, 229, 255, 0.04)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
                <span
                  className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('nutri.macros')}
                </span>
              </div>
              <MacrosBarChart
                protein={stats.macros.protein}
                fats={stats.macros.fats}
                carbs={stats.macros.carbs}
              />
            </div>

            {/* ══════════ Detail toggle ════════════════════════════ */}
            <button
              onClick={() => setDetailExpanded((prev) => !prev)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded text-[11px] text-text-muted transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'rgba(0, 229, 255, 0.03)',
                border: '1px solid rgba(0, 229, 255, 0.08)',
              }}
            >
              {detailExpanded ? (
                <>
                  <ChevronUp size={14} />
                  {t('nutri.detailHide')}
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  {t('nutri.detailShow')}
                </>
              )}
            </button>

            {/* ══════════ Detail section ════════════════════════════ */}
            {detailExpanded && (
              <div className="space-y-3 mt-3 animate-in">
                {/* —— Cuisine donut —— */}
                <div
                  className="bg-charcoal-900 rounded p-3"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.04)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {t('nutri.cuisine')}
                    </span>
                  </div>
                  <CuisineDonut data={stats.cuisineDistribution.map((c) => ({ ...c, name: lang === 'en' ? c.nameEn : c.name }))} />
                </div>

                {/* —— Tag distribution bars —— */}
                <div
                  className="bg-charcoal-900 rounded p-3"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.04)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {t('nutri.tags')}
                    </span>
                  </div>
                  {stats.tagDistribution.length === 0 ? (
                    <p
                      className="text-[11px] text-text-dim text-center py-4"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      —
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stats.tagDistribution.map(({ tag, count }) => {
                        const pct = (count / maxTagCount) * 100
                        return (
                          <div key={tag} className="flex items-center gap-2">
                            <span
                              className="text-[10px] text-text-muted w-14 truncate flex-shrink-0"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {tag}
                            </span>
                            <div
                              className="flex-1 h-2.5 rounded-full overflow-hidden"
                              style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(pct, 2)}%`,
                                  background: CYAN,
                                  opacity: 0.65,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] text-text-primary w-5 text-right flex-shrink-0"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                            >
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* —— Top 5 recipes —— */}
                <div
                  className="bg-charcoal-900 rounded p-3"
                  style={{ border: '1px solid rgba(0, 229, 255, 0.04)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {t('nutri.topRecipes')}
                    </span>
                  </div>
                  {stats.topRecipes.length === 0 ? (
                    <p
                      className="text-[11px] text-text-dim text-center py-4"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      —
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topRecipes.map(({ recipeId, count }, i) => {
                        const recipe = recipeMap.get(recipeId)
                        const name = recipe
                          ? lang === 'zh'
                            ? recipe.nameZh
                            : recipe.nameEn
                          : recipeId
                        return (
                          <div key={recipeId} className="flex items-center gap-2">
                            <span
                              className="text-[10px] text-text-dim w-4 flex-shrink-0 text-right"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {i + 1}
                            </span>
                            <span
                              className="flex-1 text-[11px] text-text-primary truncate"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {recipe?.emoji} {name}
                            </span>
                            <span
                              className="text-[10px] text-ice-400 flex-shrink-0"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                            >
                              x{count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
