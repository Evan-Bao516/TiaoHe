import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

interface Toast {
  id: number
  message: string
}

interface ToastCtx {
  toast: (message: string) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2200)
  }, [])

  const ctx = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className="px-4 py-2.5 rounded-md text-[13px] animate-in pointer-events-auto"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#F4F4F4',
              background: 'rgba(18, 22, 32, 0.95)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
