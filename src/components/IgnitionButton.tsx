import { Flame } from 'lucide-react'
import { initAudio } from '../hooks/useSoundEngine'
import { useLang } from '../i18n/context'

interface IgnitionButtonProps {
  onClick: () => void
}

export default function IgnitionButton({ onClick }: IgnitionButtonProps) {
  const { t } = useLang()
  const handleClick = () => {
    initAudio()  // iOS: must be called inside a user gesture
    onClick()
  }
  return (
    <div className="sticky bottom-0 px-4 pt-4 pb-6 z-10">
      {/* Glow ambient backdrop */}
      <div
        className="absolute inset-x-4 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(255, 159, 10, 0.06) 0%, transparent 100%)',
        }}
      />

      <button
        onClick={handleClick}
        className={`
          relative w-full flex items-center justify-center gap-3 py-4 rounded-md
          text-[15px] tracking-[0.15em] uppercase font-semibold
          transition-all duration-300
          hover:shadow-[0_0_30px_rgba(255,159,10,0.3)]
          active:scale-[0.98]
          group
        `}
        style={{
          background: 'rgba(255, 159, 10, 0.12)',
          border: '1px solid rgba(255, 159, 10, 0.35)',
          color: '#FF9F0A',
          fontFamily: 'var(--font-display)',
          boxShadow: '0 0 20px rgba(255, 159, 10, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        <Flame size={18} strokeWidth={1.5} className="text-amber-500" />
        <span>{t('detail.start')}</span>
        <span
          className="text-text-dim font-normal"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          /
        </span>
        <span
          className="text-text-muted font-normal"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('detail.startSub')}
        </span>

        {/* Hover sweep */}
        <div
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255, 159, 10, 0.08) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </button>
    </div>
  )
}
