import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function PhoneInput() {
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [clipboardCandidates, setClipboardCandidates] = React.useState<string[]>([])

  // Load persisted value on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const persisted = localStorage.getItem('phoneInput')
      if (persisted) {
        // Ensure we only set sanitized value
        const sanitized = persisted.replace(/[^0-9+()\-\s]/g, '')
        setValue(sanitized)
        const digits = sanitized.replace(/\D/g, '')
        if (digits.length > 0 && digits.length < 7) {
          setError('Please enter at least 7 digits')
        } else {
          setError(null)
        }
      }
    } catch (_) {
      // ignore
    }
  }, [])

  // Sanitize to allowed characters we support in the input
  function sanitize(raw: string) {
    return raw.replace(/[^0-9+()\-\s]/g, '')
  }

  function validateAndMaybeSet(val: string) {
    const allowed = sanitize(val)
    setValue(allowed)

    // Persist to local storage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneInput', allowed)
      }
    } catch (_) {
      // ignore
    }

    const digits = allowed.replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 7) {
      setError('Please enter at least 7 digits')
    } else {
      setError(null)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndMaybeSet(e.target.value)
  }

  // On window focus, check clipboard for phone numbers and prompt the user to pick one
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return

    const extractCandidates = (text: string) => {
      const phoneLikeRegex = /\+?\d[\d\s().-]{5,}\d/g // at least 7 digits overall with allowed separators
      const matches = text.match(phoneLikeRegex) || []
      const cleaned = matches
        .map((m) => sanitize(m))
        .map((m) => m.trim())
        .filter(Boolean)

      const seen = new Set<string>()
      const result: string[] = []
      for (const c of cleaned) {
        const digits = c.replace(/\D/g, '')
        if (digits.length >= 7 && !seen.has(digits)) {
          seen.add(digits)
          result.push(c)
        }
      }
      return result
    }

    const tryReadClipboard = async () => {
      if (!('clipboard' in navigator) || !navigator.clipboard?.readText) return
      try {
        const text = await navigator.clipboard.readText()
        if (!text) return
        const candidates = extractCandidates(text)
        if (candidates.length === 0) return

        // If clipboard contains only a phone number that is already in the input, don't show the modal
        const currentDigits = value.replace(/\D/g, '')
        const filtered = candidates.filter((c) => c.replace(/\D/g, '') !== currentDigits)
        if (filtered.length === 0) return

        setClipboardCandidates(filtered)
        setIsModalOpen(true)
      } catch (_) {
        // Ignore permission errors or unsupported environments
      }
    }

    const onFocus = () => {
      void tryReadClipboard()
    }

    window.addEventListener('focus', onFocus)
    // Also attempt once on mount (useful when the app just loaded and already focused)
    void tryReadClipboard()

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [value])

  function openWhatsApp() {
    const digits = value.replace(/\D/g, '')
    if (!digits || digits.length < 7) {
      setError('Please enter at least 7 digits')
      return
    }

    // Prefer deep link to trigger an OS app chooser if both WhatsApp and WhatsApp Business are installed.
    // On Android/iOS, both apps typically register the `whatsapp://` scheme, so omitting a package lets the system ask the user.
    const appUrl = `whatsapp://send?phone=${digits}`
    const webUrl = `https://wa.me/${digits}`

    // Try to open the app directly. If it fails (no handler), fall back to the web URL.
    // We use visibility check: if the page remains visible shortly after navigation attempt,
    // it's likely the app didn't open, so we navigate to the web URL instead.
    const tryOpenApp = () => {
      // Using assign instead of open/popups avoids popup blockers.
      window.location.href = appUrl

      const start = Date.now()
      const timeout = 1500
      const check = () => {
        const elapsed = Date.now() - start
        // If still visible and time elapsed, fallback
        if (document.visibilityState === 'visible' && elapsed >= timeout) {
          // Fallback to web version (new tab keeps our app open)
          window.open(webUrl, '_blank', 'noopener,noreferrer')
        }
      }
      // Use a single timeout; advanced approaches might use pagehide/blur listeners.
      window.setTimeout(check, timeout)
    }

    tryOpenApp()
  }

  const digitsOnly = value.replace(/\D/g, '')
  const canOpen = !error && digitsOnly.length >= 7

  return (
    <div className="mt-4 max-w-sm">
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <div className="mt-1">
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="e.g. (555) 123-4567"
          className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          value={value}
          onChange={onChange}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      {!error && value ? (
        <p className="mt-1 text-sm text-gray-600">Digits: {digitsOnly}</p>
      ) : null}
      <button
        type="button"
        onClick={openWhatsApp}
        disabled={!canOpen}
        className={`mt-3 inline-flex items-center rounded bg-green-500 px-4 py-2 text-white transition-colors ${
          canOpen ? 'hover:bg-green-600 focus:bg-green-600' : 'opacity-50 cursor-not-allowed'
        }`}
        aria-label="Open WhatsApp chat with the entered phone number"
        title={canOpen ? 'Open WhatsApp' : 'Enter a valid phone number to continue'}
      >
        Open WhatsApp Chat
      </button>

      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Use a phone number from your clipboard?</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="rounded px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-2 text-sm text-gray-600">Select a number to fill the input:</p>
            <ul className="max-h-60 space-y-2 overflow-auto">
              {clipboardCandidates.map((candidate, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(candidate)
                      setError(null)
                      setIsModalOpen(false)
                    }}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-left hover:bg-gray-50"
                  >
                    {candidate} <span className="ml-2 text-xs text-gray-500">(digits: {candidate.replace(/\D/g, '')})</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Chat Opener</h1>
          <p className="mt-1 text-sm text-gray-600">Enter a phone number and jump straight into a chat</p>
        </header>
        <PhoneInput />
      </div>
    </div>
  )
}
