import { useState, useEffect } from 'react'
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { extractPhoneCandidates, getFullDigits } from '../utils/phone'

export interface ClipboardState {
  isModalOpen: boolean
  clipboardCandidates: string[]
}

export interface ClipboardActions {
  setIsModalOpen: (open: boolean) => void
  selectCandidate: (candidate: string, onSelect: (phone: string, country?: string) => void) => void
  closeModal: () => void
}

/**
 * Custom hook for clipboard phone number detection and selection
 */
export function useClipboardDetection(
  currentValue?: string
): [ClipboardState, ClipboardActions] {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clipboardCandidates, setClipboardCandidates] = useState<string[]>([])

  /**
   * Tries to read clipboard and extract phone number candidates
   */
  const tryReadClipboard = async () => {
    if (!('clipboard' in navigator) || !navigator.clipboard?.readText) return
    
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      
      const candidates = extractPhoneCandidates(text)
      if (candidates.length === 0) return

      // If clipboard contains only a phone number that is already in the input, don't show the modal
      const currentDigits = getFullDigits(currentValue)
      const filtered = candidates.filter((c) => getFullDigits(c) !== currentDigits)
      if (filtered.length === 0) return

      setClipboardCandidates(filtered)
      setIsModalOpen(true)
    } catch (_) {
      // Ignore permission errors or unsupported environments
    }
  }

  // Set up clipboard detection on window focus
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return

    const onFocus = () => {
      void tryReadClipboard()
    }

    window.addEventListener('focus', onFocus)
    // Also attempt once on mount (useful when the app just loaded and already focused)
    void tryReadClipboard()

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [currentValue])

  const selectCandidate = (
    candidate: string, 
    onSelect: (phone: string, country?: string) => void
  ) => {
    // Extract country using libphonenumber-js
    let detectedCountry: string | undefined
    
    try {
      if (isValidPhoneNumber(candidate)) {
        const parsed = parsePhoneNumber(candidate)
        if (parsed.country) {
          detectedCountry = parsed.country
        }
      }
    } catch {
      // If parsing fails, keep current country
    }
    
    onSelect(candidate, detectedCountry)
    setIsModalOpen(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const state: ClipboardState = {
    isModalOpen,
    clipboardCandidates,
  }

  const actions: ClipboardActions = {
    setIsModalOpen,
    selectCandidate,
    closeModal,
  }

  return [state, actions]
}
