import { useState, useCallback, useRef } from 'react'

export function useConfirm() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const resolveRef = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setDialogMessage(message)
      setDialogOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true)
    resolveRef.current = null
    setDialogOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setDialogOpen(false)
  }, [])

  return { confirm, dialogOpen, dialogMessage, handleConfirm, handleCancel }
}
