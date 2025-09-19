import { useState, useEffect, useRef, useCallback } from 'react'
import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from 'libphonenumber-js'
import { STORAGE_KEYS } from '../constants/phone'
import { validatePhoneNumber, getFullDigits, localeToCountry, extractPhoneCandidates } from '../utils/phone'

export interface PhoneInputState {
  value: string | undefined
  error: string | null
  defaultCountry: CountryCode
  isReady: boolean
}

export interface PhoneInputActions {
  setValue: (value: string | undefined) => void
  setError: (error: string | null) => void
  setDefaultCountry: (country: CountryCode) => void
  handlePhoneChange: (phoneValue?: string) => void
  validatePhone: (phoneValue?: string) => void
}

/**
 * Custom hook for managing phone input state and validation
 */
export function usePhoneInput(): [PhoneInputState, PhoneInputActions] {
  const hasInitializedRef = useRef(false)
  const [value, setValue] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>('US')
  const [isReady, setIsReady] = useState(false)

  // Load persisted values on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const persisted = localStorage.getItem(STORAGE_KEYS.PHONE_INPUT)
      if (persisted) {
        setValue(persisted)
        validatePhone(persisted)
      }
      
      const persistedCountry = localStorage.getItem(STORAGE_KEYS.PHONE_COUNTRY)
      if (persistedCountry) {
        setDefaultCountry(persistedCountry as CountryCode)
      }
    } catch (_) {
      // ignore localStorage errors
    } finally {
      hasInitializedRef.current = true
      setIsReady(true)
    }
  }, [])

  // Persist country changes to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PHONE_COUNTRY, defaultCountry)
      }
    } catch (_) {
      // ignore localStorage errors
    }
  }, [defaultCountry])

  const validatePhone = useCallback((phoneValue?: string) => {
    const validation = validatePhoneNumber(phoneValue)
    setError(validation.error)
  }, [])

  const handlePhoneChange = useCallback((phoneValue?: string) => {
    setValue(phoneValue)
    validatePhone(phoneValue)
    
    // Persist to localStorage
    try {
      if (typeof window !== 'undefined') {
        if (phoneValue) {
          localStorage.setItem(STORAGE_KEYS.PHONE_INPUT, phoneValue)
        } else {
          localStorage.removeItem(STORAGE_KEYS.PHONE_INPUT)
        }
      }
    } catch (_) {
      // ignore localStorage errors
    }
  }, [validatePhone])

  const state: PhoneInputState = {
    value,
    error,
    defaultCountry,
    isReady,
  }

  const actions: PhoneInputActions = {
    setValue,
    setError,
    setDefaultCountry,
    handlePhoneChange,
    validatePhone,
  }

  return [state, actions]
}
