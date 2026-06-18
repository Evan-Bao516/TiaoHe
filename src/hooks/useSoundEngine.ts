import { useRef, useEffect, useCallback, useState } from 'react'

/* ──────────────────────────────────────────────────────────────────
   Zen-Sonic Sound Engine — Web Audio API synthesis
   ───────────────────────────────────────────────────────────────── */

let sharedCtx: AudioContext | null = null
export function getSharedAudioCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext()
  return sharedCtx
}
/* keep internal alias */
const getCtx = getSharedAudioCtx

/* iOS audio unlock: resume context on first user touch anywhere */
let unlocked = false
function unlock() {
  if (unlocked) return
  const ctx = getCtx()
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      /* Play silent buffer to force iOS to keep context running */
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf; src.connect(ctx.destination); src.start(0)
      unlocked = true
    }).catch(() => {})
  } else {
    unlocked = true
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', unlock, { once: true })
  document.addEventListener('click', unlock, { once: true })
}

/* Exported for IgnitionButton to call during click */
export function initAudio() { unlock() }

/* ── Sound synthesis functions ─────────────────────────────────── */

function playClick(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator(); const gain = ctx.createGain()
  osc.type = 'square'; osc.frequency.setValueAtTime(900, now)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.04)
  gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.06)
}

function playPulse(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator(); const gain = ctx.createGain()
  osc.type = 'sine'; osc.frequency.setValueAtTime(55, now)
  gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
  osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 1.0)
}

function playZenith(ctx: AudioContext) {
  const now = ctx.currentTime
  ;[{f:1400,a:0.10},{f:2100,a:0.06},{f:2800,a:0.04},{f:3700,a:0.025},{f:4600,a:0.015}].forEach(({f,a})=>{
    const o=ctx.createOscillator();const g=ctx.createGain()
    o.type='sine';o.frequency.setValueAtTime(f,now);o.detune.setValueAtTime((Math.random()-0.5)*3,now)
    g.gain.setValueAtTime(a,now);g.gain.exponentialRampToValueAtTime(0.001,now+2.8)
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+3.0)
  })
}

function playZenTone(ctx: AudioContext) {
  const now = ctx.currentTime
  ;[{f:660,a:0.07},{f:990,a:0.025}].forEach(({f,a})=>{
    const o=ctx.createOscillator();const g=ctx.createGain()
    o.type='sine';o.frequency.setValueAtTime(f,now)
    g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(a,now+0.03)
    g.gain.exponentialRampToValueAtTime(0.001,now+0.7)
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.8)
  })
}

/* ── Hook ──────────────────────────────────────────────────────── */

interface SoundEngine {
  click: () => void; pulse: () => void; zenith: () => void; zenTone: () => void
  flashKey: number; muted: boolean; toggleMute: () => void
}

export function useSoundEngine(active: boolean): SoundEngine {
  const ctxRef = useRef<AudioContext | null>(null)
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [flashKey, setFlashKey] = useState(0)
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('cooking-lab:soundMuted') === 'true' } catch { return false }
  })
  const isMuted = useRef(muted); isMuted.current = muted

  const toggleMute = useCallback(() => {
    setMuted((prev) => { const n = !prev; localStorage.setItem('cooking-lab:soundMuted', String(n)); return n })
  }, [])

  const bump = useCallback(() => setFlashKey((k) => k + 1), [])

  const ensureCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = getCtx()
    return ctxRef.current
  }, [])

  const click = useCallback(() => {
    if (isMuted.current) return
    /* Ensure context is running before playing */
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') { ctx.resume().then(() => playClick(ctx)).catch(() => {}) }
    else { playClick(ctx) }
    bump()
  }, [ensureCtx, bump])

  const pulse = useCallback(() => {
    if (isMuted.current) return
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') { ctx.resume().then(() => playPulse(ctx)).catch(() => {}) }
    else { playPulse(ctx) }
    bump()
  }, [ensureCtx, bump])

  const zenith = useCallback(() => {
    if (isMuted.current) return
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') { ctx.resume().then(() => playZenith(ctx)).catch(() => {}) }
    else { playZenith(ctx) }
    bump()
  }, [ensureCtx, bump])

  const zenTone = useCallback(() => {
    if (isMuted.current) return
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') { ctx.resume().then(() => playZenTone(ctx)).catch(() => {}) }
    else { playZenTone(ctx) }
    bump()
  }, [ensureCtx, bump])

  useEffect(() => {
    if (!active) { if (pulseIntervalRef.current) { clearInterval(pulseIntervalRef.current); pulseIntervalRef.current = null }; return }
    const t1 = setTimeout(() => pulse(), 3000)
    pulseIntervalRef.current = setInterval(() => pulse(), 10_000)
    return () => { clearTimeout(t1); if (pulseIntervalRef.current) { clearInterval(pulseIntervalRef.current); pulseIntervalRef.current = null } }
  }, [active, pulse])

  useEffect(() => () => { if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current) }, [])

  return { click, pulse, zenith, zenTone, flashKey, muted, toggleMute }
}
