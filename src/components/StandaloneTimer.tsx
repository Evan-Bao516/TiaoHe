import { useEffect, useState, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, ChevronLeft, Plus, Minus } from 'lucide-react'
import { useLang } from '../i18n/context'
import { getSharedAudioCtx } from '../hooks/useSoundEngine'

function playChime() {
  try {
    const ctx = getSharedAudioCtx()
    if (ctx.state === 'suspended') { ctx.resume().then(() => doChime(ctx)).catch(() => {}) }
    else doChime(ctx)
  } catch {}
}
function doChime(ctx: AudioContext) {
  const now = ctx.currentTime
  ;[880, 1100, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.3)
    gain.gain.setValueAtTime(0.15, now + i * 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 1.2)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(now + i * 0.3); osc.stop(now + i * 0.3 + 1.5)
  })
}

interface Props { onClose: () => void }

export default function StandaloneTimer({ onClose }: Props) {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const close = () => { setVisible(false); setTimeout(onClose, 400) }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  const start = useCallback(() => {
    if (totalSeconds <= 0) return
    setRemaining(totalSeconds); setRunning(true); setDone(false)
  }, [totalSeconds])

  const pause = useCallback(() => { setRunning(false) }, [])
  const resume = useCallback(() => { setRunning(true) }, [])
  const reset = useCallback(() => { setRunning(false); setRemaining(0); setDone(false) }, [])

  /* Countdown */
  useEffect(() => {
    if (!running || remaining <= 0) return
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, remaining])

  /* Detect timer completion */
  useEffect(() => {
    if (!running || remaining !== 0) return
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setRunning(false)
    setDone(true)
    playChime()
  }, [running, remaining])

  const fmt = (n: number) => String(n).padStart(2, '0')
  const displayH = Math.floor(remaining / 3600)
  const displayM = Math.floor((remaining % 3600) / 60)
  const displayS = remaining % 60

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-400 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: '#080C13', paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.1)' }}>
        <button onClick={close} className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>
        <span className="text-[17px] tracking-[0.04em] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('timer.title')}</span>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {!running && remaining === 0 && !done ? (
          <>
            {/* Time setter */}
            <div className="flex items-center gap-4 mb-10">
              {/* Hours */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setHours((h) => Math.min(99, h + 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Plus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[48px] tabular-nums text-text-primary" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {fmt(hours)}
                </span>
                <button onClick={() => setHours((h) => Math.max(0, h - 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Minus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] text-text-dim uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)' }}>{t('timer.hour')}</span>
              </div>
              <span className="text-[48px] text-text-dim pb-8" style={{ fontFamily: 'var(--font-mono)' }}>:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setMinutes((m) => Math.min(59, m + 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Plus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[48px] tabular-nums text-text-primary" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {fmt(minutes)}
                </span>
                <button onClick={() => setMinutes((m) => Math.max(0, m - 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Minus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] text-text-dim uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)' }}>{t('timer.minute')}</span>
              </div>
              <span className="text-[48px] text-text-dim pb-8" style={{ fontFamily: 'var(--font-mono)' }}>:</span>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setSeconds((s) => Math.min(59, s + 5))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Plus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[48px] tabular-nums text-text-primary" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {fmt(seconds)}
                </span>
                <button onClick={() => setSeconds((s) => Math.max(0, s - 5))}
                  className="w-12 h-12 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors">
                  <Minus size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] text-text-dim uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)' }}>{t('timer.second')}</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 mb-10">
              {[{ label: '1'+t('timer.preset'), h: 0, m: 1, s: 0 }, { label: '3'+t('timer.preset'), h: 0, m: 3, s: 0 }, { label: '5'+t('timer.preset'), h: 0, m: 5, s: 0 }, { label: '10'+t('timer.preset'), h: 0, m: 10, s: 0 }, { label: '15'+t('timer.preset'), h: 0, m: 15, s: 0 }, { label: '30'+t('timer.preset'), h: 0, m: 30, s: 0 }].map((p) => (
                <button key={p.label} onClick={() => { setHours(p.h); setMinutes(p.m); setSeconds(p.s) }}
                  className="px-3 py-1.5 rounded-md text-[11px] text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors"
                  style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(138, 148, 166, 0.1)' }}>{p.label}</button>
              ))}
            </div>

            <button onClick={start} disabled={totalSeconds <= 0}
              className="px-12 py-3.5 rounded-md text-[15px] tracking-[0.06em] font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-30 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.08)' }}>
              <Play size={18} strokeWidth={1.5} />{t('timer.start')}
            </button>
          </>
        ) : (
          <>
            {/* Running / paused display */}
            <div className={`text-[80px] tabular-nums mb-8 transition-colors duration-500 ${done ? 'text-emerald-400 animate-pulse' : running ? 'text-ice-400' : 'text-amber-500'}`}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {done ? t('timer.done') : `${fmt(displayH)}:${fmt(displayM)}:${fmt(displayS)}`}
            </div>

            <div className="flex gap-4">
              {running ? (
                <button onClick={pause}
                  className="px-10 py-3 rounded-md text-[14px] font-semibold flex items-center gap-2 transition-all duration-200 hover:brightness-110"
                  style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(255, 159, 10, 0.12)', border: '1px solid rgba(255, 159, 10, 0.25)' }}>
                  <Pause size={18} strokeWidth={1.5} />{t('timer.pause')}
                </button>
              ) : (
                <button onClick={done ? reset : resume}
                  className="px-10 py-3 rounded-md text-[14px] font-semibold flex items-center gap-2 transition-all duration-200 hover:brightness-110"
                  style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: done ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 229, 255, 0.12)', border: done ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(0, 229, 255, 0.25)' }}>
                  {done ? <RotateCcw size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
                  {done ? t('timer.reset') : t('timer.continue')}
                </button>
              )}
              <button onClick={reset}
                className="px-8 py-3 rounded-md text-[14px] font-medium transition-colors duration-200 hover:bg-charcoal-800"
                style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
                <RotateCcw size={18} strokeWidth={1.5} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
