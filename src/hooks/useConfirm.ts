import { useState, useCallback } from 'react'

interface ConfirmState {
  message: string
  resolve: ((v: boolean) => void) | null
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ message: '', resolve: null })

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ message, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ message: '', resolve: null })
  }, [state])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ message: '', resolve: null })
  }, [state])

  return {
    confirm,
    dialogOpen: state.resolve !== null,
    dialogMessage: state.message,
    handleConfirm,
    handleCancel,
  }
}
