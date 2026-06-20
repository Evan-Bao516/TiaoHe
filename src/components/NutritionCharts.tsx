import { useMemo } from 'react'

/* ── Types ─────────────────────────────────────────────────────── */

interface NutritionChartsProps {
  kcalTrend: { date: string; kcal: number }[]
  macros: { protein: number; fats: number; carbs: number }
  cuisineDistribution: { name: string; count: number; color: string }[]
}

/* ── Colour palette (matches Cyberpunk Bauhaus dark theme) ─────── */

const CYAN     = '#00E5FF'
const GREEN    = '#10B981'
const AMBER    = '#FF9F0A'
const MUTED    = '#8A94A6'
const DIM      = '#5A6272'
const BG_DARK  = '#0A0E17'
const GRID     = 'rgba(0,229,255,0.06)'

/* ── Helpers ───────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════
   KcalLineChart
   ═══════════════════════════════════════════════════════════════ */

function KcalLineChart({ data }: { data: { date: string; kcal: number }[] }) {
  const VB = { w: 300, h: 150 }
  const PAD = { t: 12, r: 8, b: 22, l: 36 }

  const plotW = VB.w - PAD.l - PAD.r
  const plotH = VB.h - PAD.t - PAD.b

  const { pathD, points, yTicks, xLabels } = useMemo(() => {
    if (data.length === 0) {
      return { pathD: '', points: [], yTicks: [] as number[], xLabels: [] as { x: number; label: string }[] }
    }

    const kcals = data.map((d) => d.kcal)
    const maxY = Math.max(...kcals, 1)
    const minY = Math.min(...kcals, 0)
    const range = maxY - minY || 1

    /* Y-axis ticks — 4 evenly spaced */
    const tickStep = range / 3
    const yTicks = [0, 1, 2, 3].map((i) => Math.round((minY + i * tickStep) * 10) / 10)

    /* Normalise each point to SVG coords */
    const pts = data.map((d, i) => {
      const x = PAD.l + (i / Math.max(data.length - 1, 1)) * plotW
      const y = PAD.t + plotH - ((d.kcal - minY) / range) * plotH
      return { x, y, label: `${d.kcal}`, date: d.date }
    })

    /* Polyline path */
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

    /* X-axis date labels (show every Nth to avoid crowding) */
    const maxLabels = 5
    const step = Math.max(1, Math.floor(data.length / maxLabels))
    const xLabels = data
      .map((d, i) => ({ i, label: d.date.slice(5) })) // "MM-DD"
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map(({ i, label }) => ({
        x: PAD.l + (i / Math.max(data.length - 1, 1)) * plotW,
        label,
      }))

    return { pathD: d, points: pts, yTicks, xLabels }
  }, [data, plotW, plotH])

  /* ── Empty state ──────────────────────────────────────────── */
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6"
        style={{ background: 'rgba(0, 229, 255, 0.02)', border: '1px solid rgba(0, 229, 255, 0.06)', borderRadius: 8 }}>
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto opacity-40" role="img" aria-label="No kcal data">
          <line x1={PAD.l} y1={PAD.t} x2={VB.w - PAD.r} y2={PAD.t} stroke={GRID} strokeWidth={0.5} />
          <line x1={PAD.l} y1={PAD.t + plotH / 2} x2={VB.w - PAD.r} y2={PAD.t + plotH / 2} stroke={GRID} strokeWidth={0.5} />
          <line x1={PAD.l} y1={VB.h - PAD.b} x2={VB.w - PAD.r} y2={VB.h - PAD.b} stroke={GRID} strokeWidth={0.5} />
          <text x={VB.w / 2} y={VB.h / 2} textAnchor="middle" dominantBaseline="central"
            fill={MUTED} fontSize="12" fontFamily="var(--font-body), sans-serif">
            No data yet
          </text>
        </svg>
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto" role="img" aria-label="Daily kcal trend line chart">
      {/* Horizontal grid lines */}
      {yTicks.map((_, i) => {
        const y = PAD.t + (i / 3) * plotH
        return <line key={`grid-${i}`} x1={PAD.l} y1={y} x2={VB.w - PAD.r} y2={y} stroke={GRID} strokeWidth={1} />
      })}

      {/* Y-axis labels */}
      {yTicks.map((v, i) => {
        const y = PAD.t + (i / 3) * plotH
        return (
          <text key={`y-${i}`} x={PAD.l - 6} y={y} textAnchor="end" dominantBaseline="central"
            fill={DIM} fontSize="9" fontFamily="var(--font-mono), monospace">
            {v}
          </text>
        )
      })}

      {/* X-axis date labels */}
      {xLabels.map((xl, i) => (
        <text key={`x-${i}`} x={xl.x} y={VB.h - 4} textAnchor="middle"
          fill={DIM} fontSize="8" fontFamily="var(--font-mono), monospace">
          {xl.label}
        </text>
      ))}

      {/* Polyline */}
      <path d={pathD} fill="none" stroke={CYAN} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={`pt-${i}`} cx={p.x} cy={p.y} r={2.5} fill={CYAN} opacity={0.9}>
          <title>{p.date}: {p.label} kcal</title>
        </circle>
      ))}

      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={VB.h - PAD.b} stroke={DIM} strokeWidth={0.5} opacity={0.4} />
      <line x1={PAD.l} y1={VB.h - PAD.b} x2={VB.w - PAD.r} y2={VB.h - PAD.b} stroke={DIM} strokeWidth={0.5} opacity={0.4} />
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════════
   MacrosBarChart
   ═══════════════════════════════════════════════════════════════ */

interface MacroRow {
  key: string
  label: string
  value: number
  color: string
  unit: string
}

function MacrosBarChart({ protein, fats, carbs }: { protein: number; fats: number; carbs: number }) {
  const total = protein + fats + carbs

  const rows: MacroRow[] = useMemo(() => [
    { key: 'protein', label: 'Protein', value: protein, color: GREEN,  unit: 'g' },
    { key: 'fats',    label: 'Fats',    value: fats,    color: AMBER,  unit: 'g' },
    { key: 'carbs',   label: 'Carbs',   value: carbs,   color: CYAN,   unit: 'g' },
  ], [protein, fats, carbs])

  const BAR_HEIGHT = 22
  const BAR_GAP = 10
  const LABEL_W = 52
  const VAL_W = 48
  const VB_H = rows.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP + 4
  const VB_W = 300
  const BAR_MAX_W = VB_W - LABEL_W - VAL_W - 12

  /* Largest value for scaling (minimum 1 to avoid division by zero) */
  const maxVal = Math.max(...rows.map((r) => r.value), 1)

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" role="img" aria-label="Macronutrient bar chart">
      <defs>
        {rows.map((r) => (
          <filter key={`glow-${r.key}`} id={`bar-glow-${r.key}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {rows.map((r, i) => {
        const y = i * (BAR_HEIGHT + BAR_GAP)
        const barW = total > 0 ? (r.value / maxVal) * BAR_MAX_W : 0
        const pct = total > 0 ? Math.round((r.value / total) * 100) : 0

        return (
          <g key={r.key}>
            {/* Label */}
            <text x={0} y={y + BAR_HEIGHT / 2} textAnchor="start" dominantBaseline="central"
              fill={MUTED} fontSize="11" fontFamily="var(--font-body), sans-serif" fontWeight={500}>
              {r.label}
            </text>

            {/* Bar track (subtle background) */}
            <rect x={LABEL_W} y={y} width={BAR_MAX_W} height={BAR_HEIGHT} rx={4}
              fill="rgba(255,255,255,0.03)" />

            {/* Bar fill */}
            <rect x={LABEL_W} y={y} width={Math.max(barW, 0)} height={BAR_HEIGHT} rx={4}
              fill={r.color} opacity={0.85}
              filter={`url(#bar-glow-${r.key})`}
              style={{ transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />

            {/* Value on right */}
            <text x={LABEL_W + BAR_MAX_W + 6} y={y + BAR_HEIGHT / 2} textAnchor="start" dominantBaseline="central"
              fill="#F4F4F4" fontSize="11" fontFamily="var(--font-mono), monospace" fontWeight={600}>
              {r.value}{r.unit}
            </text>

            {/* Percentage */}
            <text x={LABEL_W + Math.max(barW, 0) - 4} y={y + BAR_HEIGHT / 2} textAnchor="end" dominantBaseline="central"
              fill={BG_DARK} fontSize="9" fontFamily="var(--font-mono), monospace" fontWeight={700} opacity={barW > 20 ? 0.7 : 0}>
              {pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════════
   CuisineDonut
   ═══════════════════════════════════════════════════════════════ */

function CuisineDonut({ data }: { data: { name: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const CX = 80
  const CY = 70
  const R = 55
  const STROKE_W = 20
  const CIRCUMFERENCE = 2 * Math.PI * R

  /* Sort descending for consistent rendering */
  const sorted = useMemo(() => [...data].sort((a, b) => b.count - a.count), [data])

  /* Build stroke-dasharray / stroke-dashoffset for each segment */
  const segments = useMemo(() => {
    if (total === 0) return []
    let offset = 0
    return sorted.map((d) => {
      const length = (d.count / total) * CIRCUMFERENCE
      const seg = { ...d, dashArray: `${length} ${CIRCUMFERENCE - length}`, dashOffset: -offset }
      offset += length
      return seg
    })
  }, [sorted, total, CIRCUMFERENCE])

  /* ── Empty state ──────────────────────────────────────────── */
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6"
        style={{ background: 'rgba(0, 229, 255, 0.02)', border: '1px solid rgba(0, 229, 255, 0.06)', borderRadius: 8 }}>
        <svg viewBox="0 0 160 200" className="w-full h-auto" role="img" aria-label="No cuisine data">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={GRID} strokeWidth={STROKE_W} />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
            fill={MUTED} fontSize="13" fontFamily="var(--font-mono), monospace" fontWeight={700}>
            0
          </text>
          <text x={CX} y={CY + R + 24} textAnchor="middle"
            fill={DIM} fontSize="9" fontFamily="var(--font-body), sans-serif">
            No entries yet
          </text>
        </svg>
      </div>
    )
  }

  const legendY = CY + R + 20

  return (
    <svg viewBox="0 0 160 200" className="w-full h-auto" role="img" aria-label="Cuisine distribution donut chart">
      {/* Background ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={GRID} strokeWidth={STROKE_W} />

      {/* Segments */}
      {segments.map((seg, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none"
          stroke={seg.color} strokeWidth={STROKE_W}
          strokeDasharray={seg.dashArray}
          strokeDashoffset={seg.dashOffset}
          strokeLinecap="round"
          opacity={0.85}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <title>{seg.name}: {seg.count}</title>
        </circle>
      ))}

      {/* Center total */}
      <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
        fill="#F4F4F4" fontSize="18" fontFamily="var(--font-mono), monospace" fontWeight={700}>
        {total}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="central"
        fill={DIM} fontSize="7" fontFamily="var(--font-body), sans-serif" fontWeight={500} letterSpacing="0.15em">
        Total
      </text>

      {/* Legend */}
      {sorted.map((d, i) => {
        const ly = legendY + i * 18
        return (
          <g key={i}>
            <circle cx={CX - 38} cy={ly} r={3} fill={d.color} opacity={0.85} />
            <text x={CX - 30} y={ly} dominantBaseline="central"
              fill={MUTED} fontSize="8" fontFamily="var(--font-body), sans-serif">
              {d.name}
            </text>
            <text x={CX + 38} y={ly} textAnchor="end" dominantBaseline="central"
              fill="#F4F4F4" fontSize="8" fontFamily="var(--font-mono), monospace" fontWeight={600}>
              {d.count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}


/* ═══════════════════════════════════════════════════════════════
   NutritionCharts — composite export
   ═══════════════════════════════════════════════════════════════ */

export default function NutritionCharts({
  kcalTrend = [],
  macros = { protein: 0, fats: 0, carbs: 0 },
  cuisineDistribution = [],
}: NutritionChartsProps) {
  return (
    <section className="relative px-4 pt-6 pb-4 space-y-6">
      {/* ── Section header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: 12, height: 1, background: CYAN, opacity: 0.5 }} />
        <span className="text-[10px] tracking-[0.2em] uppercase text-text-dim"
          style={{ fontFamily: 'var(--font-mono)' }}>
          Nutrition Charts
        </span>
      </div>

      {/* ── Kcal Trend ─────────────────────────────────────── */}
      <div className="animate-in" style={{ animationDelay: '0ms' }}>
        <span className="block text-[11px] tracking-[0.15em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 500, color: MUTED }}>
          Daily Kcal Trend
        </span>
        <KcalLineChart data={kcalTrend} />
      </div>

      {/* ── Macros ─────────────────────────────────────────── */}
      <div className="animate-in" style={{ animationDelay: '80ms' }}>
        <span className="block text-[11px] tracking-[0.15em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 500, color: MUTED }}>
          Macronutrients
        </span>
        <MacrosBarChart protein={macros.protein} fats={macros.fats} carbs={macros.carbs} />
      </div>

      {/* ── Cuisine Distribution ──────────────────────────── */}
      <div className="animate-in" style={{ animationDelay: '160ms' }}>
        <span className="block text-[11px] tracking-[0.15em] uppercase mb-2 text-center"
          style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 500, color: MUTED }}>
          Cuisine Distribution
        </span>
        <CuisineDonut data={cuisineDistribution} />
      </div>
    </section>
  )
}


/* ── Named exports for individual use ──────────────────────────── */

export { KcalLineChart, MacrosBarChart, CuisineDonut }
