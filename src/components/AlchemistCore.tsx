import { BookOpen } from 'lucide-react'
import { useLang } from '../i18n/context'
import type { FlavorProfile, Macros, Ingredient } from '../data/types'

interface AlchemistCoreProps {
  activeSubstitutions: Set<string>
  flavorProfile: FlavorProfile
  macros: Macros
  totalKcal: number
  ingredients: Ingredient[]
}

/* ── Geometry helpers ─────────────────────────────────────────── */

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function donutSegmentPath(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number): string {
  const os = polar(cx, cy, outerR, startAngle)
  const oe = polar(cx, cy, outerR, endAngle)
  const ie = polar(cx, cy, innerR, endAngle)
  const is_ = polar(cx, cy, innerR, startAngle)
  const la = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${os.x.toFixed(2)} ${os.y.toFixed(2)} A ${outerR} ${outerR} 0 ${la} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)} L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)} A ${innerR} ${innerR} 0 ${la} 0 ${is_.x.toFixed(2)} ${is_.y.toFixed(2)} Z`
}

/* ── Flavor radar labels ──────────────────────────────────────── */

const FLAVORS = [
  { key: 'acid' as const,   label: '酸', en: 'Acid' },
  { key: 'sweet' as const,  label: '甜', en: 'Sweet' },
  { key: 'bitter' as const, label: '苦', en: 'Bitter' },
  { key: 'spicy' as const,  label: '辣', en: 'Spicy' },
  { key: 'salty' as const,  label: '咸', en: 'Salty' },
  { key: 'umami' as const,  label: '鲜', en: 'Umami' },
] as const

/* Hexagon vertex — index 0 is top, going clockwise */
function hexVertex(cx: number, cy: number, r: number, i: number) {
  const angle = -Math.PI / 2 + (Math.PI / 3) * i
  return polar(cx, cy, r, angle)
}

function radarPolygon(cx: number, cy: number, values: number[], maxR: number): string {
  return values.map((v, i) => {
    const p = hexVertex(cx, cy, v * maxR, i)
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
  }).join(' ') + ' Z'
}

/* ── Layout constants ─────────────────────────────────────────── */

const VB = 360
const CX = 180
const CY = 180
const OUTER_R = 130
const INNER_R = 82
const RADAR_R = 70

const MACRO_COLORS = [
  { key: 'Protein', color: '#10B981' },
  { key: 'Fats',    color: '#EAB308' },
  { key: 'Carbs',   color: '#2D3340' },
]

export default function AlchemistCore({
  activeSubstitutions,
  flavorProfile,
  macros,
  totalKcal,
  ingredients,
}: AlchemistCoreProps) {
  const { t, lang } = useLang()
  /* Build donut segments from macros */
  const SEGMENTS = MACRO_COLORS.map((m, i) => ({
    label: m.key,
    pct: [macros.protein, macros.fats, macros.carbs][i],
    color: m.color,
  }))

  const startAngles: number[] = []
  let a = -Math.PI / 2
  for (const seg of SEGMENTS) {
    startAngles.push(a)
    a += seg.pct * 2 * Math.PI
  }

  /* Compute flavor profile — original + substitution deltas */
  const origValues = FLAVORS.map((f) => flavorProfile[f.key])
  const subValues = FLAVORS.map((f) => {
    let value = flavorProfile[f.key]
    for (const id of activeSubstitutions) {
      const ing = ingredients.find((i) => i.id === id)
      const delta = ing?.substitution?.flavorDelta?.[f.key]
      if (delta !== undefined) value += delta
    }
    return Math.max(0, Math.min(1, value))
  })
  const hasAnySub = activeSubstitutions.size > 0
  const isTheory = totalKcal === 0
  const gridSteps = [0.25, 0.5, 0.75, 1.0]

  if (isTheory) {
    return (
      <section className="relative px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 12, height: 1, background: '#10B981', opacity: 0.5 }} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
            Knowledge Base
          </span>
        </div>
        <div className="flex flex-col items-center py-10"
          style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.06)', borderRadius: 8 }}>
          <BookOpen size={28} strokeWidth={1} style={{ color: '#10B981', opacity: 0.5, marginBottom: 12 }} />
          <span className="text-[13px] text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
            {t('detail.theory')}
          </span>
        </div>
      </section>
    )
  }

  function labelProps(i: number) {
    const map: Record<number, { anchor: 'middle' | 'start' | 'end'; dy: string }> = {
      0: { anchor: 'middle', dy: '-0.4em' },
      1: { anchor: 'start',  dy: '0.35em' },
      2: { anchor: 'start',  dy: '0.35em' },
      3: { anchor: 'middle', dy: '1.2em' },
      4: { anchor: 'end',    dy: '0.35em' },
      5: { anchor: 'end',    dy: '0.35em' },
    }
    return map[i]
  }

  return (
    <section className="relative px-4 pt-6 pb-2">
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 12, height: 1, background: '#00E5FF', opacity: 0.5 }} />
        <span className="text-[10px] tracking-[0.2em] uppercase text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          Alchemist Core
        </span>
      </div>

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full max-w-[360px] h-auto" role="img" aria-label="Nutrition donut chart with flavor radar">
          {SEGMENTS.map((seg, i) => {
            const endAngle = startAngles[i] + seg.pct * 2 * Math.PI
            return (
              <path key={seg.label} d={donutSegmentPath(CX, CY, OUTER_R, INNER_R, startAngles[i], endAngle)}
                fill={seg.color} opacity={0.85} stroke="#0A0E17" strokeWidth={1.5}>
                <title>{seg.label}: {Math.round(seg.pct * 100)}%</title>
              </path>
            )
          })}

          <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="rgba(0, 229, 255, 0.22)" strokeWidth={0.75} />
          <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="rgba(0, 229, 255, 0.16)" strokeWidth={0.75} />

          {gridSteps.map((step) => {
            const pts = Array.from({ length: 6 }, (_, i) => hexVertex(CX, CY, RADAR_R * step, i))
            const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
            return <path key={step} d={d} fill="none" stroke="rgba(0, 229, 255, 0.25)" strokeWidth={0.75} />
          })}

          {FLAVORS.map((_, i) => {
            const v = hexVertex(CX, CY, RADAR_R, i)
            return <line key={`axis-${i}`} x1={CX} y1={CY} x2={v.x} y2={v.y} stroke="rgba(0, 229, 255, 0.18)" strokeWidth={0.75} />
          })}

          <path d={radarPolygon(CX, CY, origValues, RADAR_R)} fill="rgba(0, 229, 255, 0.12)" stroke="#00E5FF" strokeWidth={1.5} strokeLinejoin="round" />

          {hasAnySub && (
            <path d={radarPolygon(CX, CY, subValues, RADAR_R)} fill="rgba(255, 46, 147, 0.06)" stroke="#FF2E93" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
          )}

          {origValues.map((v, i) => {
            const p = hexVertex(CX, CY, v * RADAR_R, i)
            return <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={2.5} fill="#00E5FF" opacity={0.9} />
          })}
          {hasAnySub && subValues.map((v, i) => {
            const p = hexVertex(CX, CY, v * RADAR_R, i)
            return <circle key={`subdot-${i}`} cx={p.x} cy={p.y} r={2.5} fill="#FF2E93" opacity={0.9} />
          })}

          {FLAVORS.map((f, i) => {
            const angle = -Math.PI / 2 + (Math.PI / 3) * i
            const p = polar(CX, CY, OUTER_R + 22, angle)
            const { anchor, dy } = labelProps(i)
            return (
              <text key={`lbl-${f.key}`} x={p.x} y={p.y} textAnchor={anchor} fill="#8A94A6" fontSize="12"
                fontFamily="var(--font-body), sans-serif" fontWeight={500} dy={dy}>
                {lang === 'en' ? f.en : f.label}
              </text>
            )
          })}

          {SEGMENTS.map((seg, i) => {
            const y = 340 + i * 16
            return (
              <g key={`legend-${seg.label}`}>
                <circle cx={22} cy={y} r={3.5} fill={seg.color} opacity={0.85} />
                <text x={32} y={y} fill="#8A94A6" fontSize="10" fontFamily="var(--font-body), sans-serif" dominantBaseline="central">
                  {seg.label} {Math.round(seg.pct * 100)}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-col items-center -mt-3 mb-2">
        <div style={{ width: 40, height: 1, background: 'rgba(0, 229, 255, 0.12)', marginBottom: 8 }} />
        <span className="text-[44px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, color: '#F4F4F4' }}>
          {totalKcal}
        </span>
        <span className="text-[11px] tracking-[0.18em] uppercase mt-0.5" style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 500, color: '#8A94A6' }}>
          Total Kcal
        </span>
      </div>

      <div className={`flex items-center justify-center gap-2 mt-1 transition-all duration-500 ${hasAnySub ? 'opacity-100 max-h-8' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <span className="inline-block w-5" style={{ borderTop: '1.5px dashed #FF2E93' }} />
        <span className="text-[11px] tracking-wider uppercase" style={{ color: '#FF2E93', fontFamily: 'var(--font-mono)' }}>
          Flavor Profile Shift Active
        </span>
      </div>
    </section>
  )
}
