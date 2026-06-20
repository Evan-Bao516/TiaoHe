import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Timer, ChevronRight, ArrowRight, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useSoundEngine } from '../hooks/useSoundEngine'
import { useLang } from '../i18n/context'

import type { Step } from '../data/types'

interface FocusModeProps {
  steps: Step[]
  onExit: () => void
  onComplete: (completionRatio: number) => void
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*min/)
  return match ? parseInt(match[1], 10) * 60 : 0
}

export default function FocusMode({ steps, onExit, onComplete }: FocusModeProps) {
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [flash, setFlash] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const prevStepRef = useRef(activeStep)
  const firedRef = useRef<Set<number>>(new Set())
  const isPausedRef = useRef(false)

  const sound = useSoundEngine(true)
  const soundRef = useRef(sound)
  useEffect(() => { soundRef.current = sound }, [sound])
  const { lang, t } = useLang()
  const isLastStep = activeStep === steps.length - 1
  const isTheory = parseDuration(steps[activeStep].duration) === 0
  const hasActiveTimer = !isTheory && countdown > 0

  /* Sync paused ref for interval access */
  useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

  /* ── Landscape prompt ───────────────────────────────────────── */
  const [isPortrait, setIsPortrait] = useState(false)
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  /* Pause when portrait, auto-resume when rotated to landscape */
  useEffect(() => {
    if (isPortrait && hasActiveTimer) setIsPaused(true)
    if (!isPortrait && isPaused && hasActiveTimer) setIsPaused(false)
  }, [isPortrait, hasActiveTimer, isPaused])

  /* ── Force landscape via Screen Orientation API (works in PWA) ─ */
  useEffect(() => {
    try {
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {})
      }
    } catch {}
    return () => {
      try { screen.orientation?.unlock() } catch {}
    }
  }, [])

  /* ── Enter animation ────────────────────────────────────────── */
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  /* ── Sound → UI flash sync ──────────────────────────────────── */
  useEffect(() => {
    if (sound.flashKey === 0) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 200)
    return () => clearTimeout(t)
  }, [sound.flashKey])

  /* ── Reset countdown on step change ──────────────────────────── */
  useEffect(() => {
    const duration = parseDuration(steps[activeStep].duration)
    setCountdown(duration)
    firedRef.current = new Set()
  }, [activeStep])

  /* ── Countdown timer (respects pause) ────────────────────────── */
  useEffect(() => {
    if (countdown <= 0 || isPaused) return

    const id = setTimeout(() => {
      const next = countdown - 1

      /* Milestone sounds — zen tone, not the bell */
      if ([30, 10, 5].includes(next) && !firedRef.current.has(next)) {
        firedRef.current.add(next)
        soundRef.current.zenTone()
      }

      /* Auto-advance on completion — the step-change effect handles zenith */
      if (next === 0 && activeStep < steps.length - 1) {
        setActiveStep((s) => s + 1)
        return
      }

      setCountdown(next)
    }, 1000)

    return () => clearTimeout(id)
  }, [countdown, activeStep, isPaused])

  /* ── Step changes → zenith bell ──────────────────────────────── */
  useEffect(() => {
    if (prevStepRef.current !== activeStep) {
      soundRef.current.zenith()
      prevStepRef.current = activeStep
    }
  }, [activeStep])

  /* ── Exit with confirmation ──────────────────────────────────── */
  const handleExitRequest = useCallback(() => {
    sound.click()
    if (hasActiveTimer && !isTheory) {
      setShowConfirm(true)
    } else {
      setVisible(false)
      onComplete?.((activeStep + 1) / steps.length)
      setTimeout(onExit, 400)
    }
  }, [onExit, onComplete, sound, hasActiveTimer, isTheory, activeStep, steps.length])

  const handleConfirmExit = useCallback(() => {
    sound.click()
    setShowConfirm(false)
    setVisible(false)
    onComplete?.((activeStep + 1) / steps.length)
    setTimeout(onExit, 400)
  }, [onExit, onComplete, sound, activeStep, steps.length])

  const handleCancelExit = useCallback(() => {
    sound.click()
    setShowConfirm(false)
  }, [sound])

  /* ── Timeline node tap ───────────────────────────────────────── */
  const handleStepTap = useCallback(
    (i: number) => {
      sound.click()
      setActiveStep(i)
    },
    [sound],
  )

  /* ── Keyboard shortcuts ──────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        if (hasActiveTimer && !isTheory) {
          setIsPaused((p) => !p)
          sound.click()
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        if (showConfirm) handleCancelExit()
        else handleExitRequest()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasActiveTimer, isTheory, showConfirm, handleExitRequest, handleCancelExit])

  /* ── Next / Complete ─────────────────────────────────────────── */
  const handleAdvance = useCallback(() => {
    sound.click()
    if (activeStep < steps.length - 1) {
      setActiveStep((s) => s + 1)
    } else {
      setCelebrating(true)
      sound.zenith()
      setTimeout(() => {
        setVisible(false)
        onComplete?.(1)
        setTimeout(onExit, 400)
      }, 1200)
    }
  }, [activeStep, onExit, onComplete, sound])

  const current = steps[activeStep]

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ background: '#080C13' }}
    >
      {/* ── Landscape prompt overlay ──────────────────────────────── */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080C13] gap-4">
          <span className="text-[48px]">📱</span>
          <p className="text-[18px] text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {t('focus.rotatePrompt')}
          </p>
          <p className="text-[13px] text-text-dim" style={{ fontFamily: 'var(--font-body)' }}>
            {t('focus.rotateHint')}
          </p>
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.15)',
            }}
          >
            <span
              className="text-sm text-ice-400"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            >
              {activeStep + 1}/{steps.length}
            </span>
          </div>
          <span
            className="text-xs tracking-[0.2em] uppercase text-text-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {t('focus.title')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound toggle */}
          <button onClick={sound.toggleMute}
            className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors"
            aria-label={sound.muted ? 'Unmute sounds' : 'Mute sounds'}>
            {sound.muted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
          </button>

          <button
            onClick={handleExitRequest}
            className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary transition-colors"
            aria-label="Exit focus mode"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Body: timeline (left) + instruction (center) ──────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left timeline rail ────────────────────────────────── */}
        <div
          className="flex-shrink-0 w-[72px] flex flex-col items-center pt-8 pb-4 overflow-y-auto"
          style={{ borderRight: '1px solid rgba(0, 229, 255, 0.06)' }}
        >
          <div className="relative flex flex-col items-center gap-5">
            {/* Vertical spine */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0, 229, 255, 0.3), rgba(0, 229, 255, 0.08), rgba(0, 229, 255, 0.3))',
              }}
            />

            {steps.map((_, i) => {
              const isActive = i === activeStep
              const isDone = i < activeStep
              return (
                <button
                  key={i}
                  onClick={() => handleStepTap(i)}
                  className={`
                    relative z-10 w-[30px] h-[30px] rounded-md flex items-center justify-center
                    transition-all duration-300 flex-shrink-0
                    ${isActive ? 'scale-110' : ''}
                  `}
                  style={{
                    background: isActive
                      ? 'rgba(0, 229, 255, 0.12)'
                      : isDone
                        ? 'rgba(0, 229, 255, 0.06)'
                        : 'transparent',
                    border: isActive
                      ? '1px solid rgba(0, 229, 255, 0.4)'
                      : isDone
                        ? '1px solid rgba(0, 229, 255, 0.15)'
                        : '1px solid rgba(138, 148, 166, 0.1)',
                    boxShadow: isActive
                      ? '0 0 12px rgba(0, 229, 255, 0.15)'
                      : 'none',
                  }}
                  aria-label={`Step ${i + 1}`}
                >
                  {isDone ? (
                    <ChevronRight size={14} strokeWidth={2} className="text-ice-400" />
                  ) : (
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: isActive ? '#00E5FF' : '#5A6272',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Center instruction area ────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
          {/* The entire card flickers subtly when any sound fires */}
          <div
            className={`
              animate-in text-center w-full max-w-[380px]
              transition-opacity duration-150
              ${flash ? 'opacity-60' : 'opacity-100'}
            `}
            key={activeStep}
          >
            {/* Step number */}
            <span
              className="text-[12px] tracking-[0.2em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF' }}
            >
              {t('focus.step')} {activeStep + 1}
            </span>

            {/* Step name — language-aware */}
            <h2
              className="text-[36px] leading-tight mt-2 mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F4F4F4' }}
            >
              {lang === 'en' ? current.en : current.zh}
            </h2>

            {/* Subtitle — opposite language */}
            <p
              className="text-[15px] tracking-wide mt-0 mb-5"
              style={{ fontFamily: 'var(--font-body)', color: '#8A94A6' }}
            >
              {lang === 'en' ? current.zh : current.en}
            </p>

            {/* Countdown display */}
            {(() => {
              const hasTimer = parseDuration(current.duration) > 0

              if (!hasTimer) {
                return (
                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-md mb-6"
                    style={{ background: 'rgba(138, 148, 166, 0.04)', border: '1px solid rgba(138, 148, 166, 0.08)' }}>
                    <span className="text-[15px] tracking-[0.1em]"
                      style={{ fontFamily: 'var(--font-mono)', color: '#5A6272', fontWeight: 500 }}>
                      {t('focus.theoryReading')}
                    </span>
                  </div>
                )
              }

              if (isPaused) {
                return (
                  <button onClick={() => setIsPaused(false)}
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-md mb-6 animate-pulse transition-all duration-200 hover:brightness-110"
                    style={{ background: 'rgba(255, 159, 10, 0.06)', border: '1px solid rgba(255, 159, 10, 0.15)' }}>
                    <Play size={16} strokeWidth={2} style={{ color: '#FF9F0A' }} />
                    <span className="text-[15px] tracking-[0.1em]"
                      style={{ fontFamily: 'var(--font-mono)', color: '#FF9F0A', fontWeight: 700 }}>
                      {t('focus.pauseHint')}
                    </span>
                  </button>
                )
              }

              const isUrgent = countdown <= 30
              const isCritical = countdown <= 10
              const isFinal = countdown <= 5

              const timerColor = isFinal ? '#FF2E93' : isCritical ? '#FF9F0A' : isUrgent ? '#F5A623' : '#00E5FF'
              const timerBg = isFinal ? 'rgba(255, 46, 147, 0.08)' : isCritical ? 'rgba(255, 159, 10, 0.08)' : isUrgent ? 'rgba(245, 166, 35, 0.06)' : 'rgba(0, 229, 255, 0.08)'
              const timerBorder = isFinal ? '1px solid rgba(255, 46, 147, 0.25)' : isCritical ? '1px solid rgba(255, 159, 10, 0.25)' : isUrgent ? '1px solid rgba(245, 166, 35, 0.18)' : '1px solid rgba(0, 229, 255, 0.15)'

              const m = Math.floor(countdown / 60)
              const s = countdown % 60
              const display = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

              return (
                <button onClick={() => setIsPaused(true)}
                  className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-md mb-6 transition-all duration-300 hover:brightness-110 ${isFinal ? 'animate-pulse' : ''}`}
                  style={{ background: timerBg, border: timerBorder }}>
                  <Timer size={16} strokeWidth={1.5} style={{ color: timerColor }} />
                  <span className="text-[26px] tracking-[0.04em] tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)', color: timerColor, fontWeight: 700 }}>
                    {display}
                  </span>
                  <Pause size={15} strokeWidth={2} style={{ color: timerColor, opacity: 0.6 }} />
                </button>
              )
            })()}

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: 'rgba(0, 229, 255, 0.2)', margin: '0 auto 20px' }} />

            {/* Instructions — language-aware */}
            <p
              className="text-[18px] leading-relaxed"
              style={{ fontFamily: 'var(--font-body)', color: '#C8CDD4' }}
            >
              {lang === 'en' ? current.en : current.detail}
            </p>

            {/* Step progress bar */}
            <div className="mt-8 flex items-center gap-1.5 max-w-[200px] mx-auto">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background:
                      i < activeStep
                        ? '#00E5FF'
                        : i === activeStep
                          ? 'rgba(0, 229, 255, 0.6)'
                          : 'rgba(138, 148, 166, 0.12)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom controls ───────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{ borderTop: '1px solid rgba(0, 229, 255, 0.08)' }}
      >
        <div className="flex gap-3">
          <button
            onClick={handleExitRequest}
            className="flex-1 py-3 rounded-md text-[13px] tracking-wider uppercase font-medium transition-colors duration-200 hover:bg-charcoal-800"
            style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
            {isPaused ? t('focus.paused') : t('focus.exit')}
          </button>
          <button
            onClick={handleAdvance}
            className="flex-[2] py-3 rounded-md text-[13px] tracking-wider uppercase font-semibold transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.08)' }}>
            {(() => {
              if (isTheory) return isLastStep ? t('focus.finishReading') : t('focus.continueReading')
              if (isLastStep) return celebrating ? t('focus.celebrating') : t('focus.complete')
              return <span className="flex items-center gap-2">{t('focus.nextStep')}<ArrowRight size={16} strokeWidth={1.5} /></span>
            })()}
          </button>
        </div>
      </div>

      {/* ── Exit confirmation overlay ────────────────────────────── */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 animate-in">
          <div className="mx-6 p-6 rounded-lg text-center"
            style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.15)', boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)' }}>
            <p className="text-[15px] text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {t('focus.confirmTitle')}
            </p>
            <p className="text-[12px] text-text-muted mb-5" style={{ fontFamily: 'var(--font-body)' }}>
              {t('focus.confirmMsg')}
            </p>
            <div className="flex gap-3">
              <button onClick={handleCancelExit}
                className="flex-1 py-2.5 rounded-md text-[12px] tracking-wider uppercase font-medium transition-colors duration-200 hover:bg-charcoal-800"
                style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
                {t('focus.continueCooking')}
              </button>
              <button onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-md text-[12px] tracking-wider uppercase font-semibold transition-all duration-200 hover:brightness-110"
                style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(255, 46, 147, 0.12)', border: '1px solid rgba(255, 46, 147, 0.25)' }}>
                {t('focus.confirmExit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Steps are now provided via props from the recipe data model */
