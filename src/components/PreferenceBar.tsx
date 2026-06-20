import { X } from 'lucide-react'
import { useLang } from '../i18n/context'
import { useConfirm } from '../hooks/useConfirm'
import ConfirmDialog from './ConfirmDialog'

interface PreferenceBarProps {
  tags: string[]
  onReset: () => void
}

export default function PreferenceBar({ tags, onReset }: PreferenceBarProps) {
  const { t } = useLang()
  const confirm = useConfirm()

  if (tags.length === 0) return null

  return (
    <div className="px-4 pb-3">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md flex-wrap"
        style={{
          background: 'linear-gradient(105deg, rgba(0, 229, 255, 0.04), rgba(255, 46, 147, 0.03))',
          border: '1px solid rgba(0, 229, 255, 0.08)',
        }}
      >
        <span className="text-[13px] flex-shrink-0">🧬</span>
        <span
          className="text-[10px] tracking-[0.08em] uppercase text-text-dim flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {t('pref.yourTaste')}
        </span>
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[10px]"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#F4F4F4',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
            }}
          >
            {tag}
          </span>
        ))}
        <div className="flex-1" />
        <button
          onClick={async (e) => {
            e.stopPropagation()
            const ok = await confirm.confirm(t('pref.resetConfirm'))
            if (ok) onReset()
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] tracking-[0.06em] transition-colors duration-200 hover:text-[#FF2E93]"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#5A6272',
          }}
        >
          <X size={10} strokeWidth={1.5} />
          {t('pref.reset')}
        </button>
      </div>

      {confirm.dialogOpen && (
        <ConfirmDialog message={confirm.dialogMessage} onConfirm={confirm.handleConfirm} onCancel={confirm.handleCancel} />
      )}
    </div>
  )
}
