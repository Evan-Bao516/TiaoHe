import { AlertTriangle } from 'lucide-react'
import { useLang } from '../i18n/context'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const { lang } = useLang()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in"
      style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="mx-6 p-5 rounded-xl text-center max-w-[300px]"
        style={{ background: '#121620', border: '1px solid rgba(0, 229, 255, 0.15)', boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)' }}>
        <AlertTriangle size={28} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: '#FF9F0A' }} />
        <p className="text-[13px] text-text-primary mb-5 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-md text-[11px] transition-colors"
            style={{ fontFamily: 'var(--font-display)', color: '#8A94A6', border: '1px solid rgba(138, 148, 166, 0.15)' }}>
            {lang === 'en' ? 'Cancel' : '取消'}
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-md text-[11px] font-semibold transition-all hover:brightness-110"
            style={{ fontFamily: 'var(--font-display)', color: '#F4F4F4', background: 'rgba(255, 46, 147, 0.12)', border: '1px solid rgba(255, 46, 147, 0.25)' }}>
            {lang === 'en' ? 'Confirm' : '确认'}
          </button>
        </div>
      </div>
    </div>
  )
}
