import { useState, useCallback } from 'react'

let _add = null

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  _add = useCallback((message, duration = 3000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-200 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="bg-gray-950 text-white text-[13px] px-4 py-2.5 rounded-lg shadow-md animate-toast-in">
          {t.message}
        </div>
      ))}
    </div>
  )
}

/** Call this anywhere to show a toast */
export function toast(message, duration) {
  _add?.(message, duration)
}
