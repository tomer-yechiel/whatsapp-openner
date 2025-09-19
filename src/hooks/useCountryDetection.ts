import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../constants/phone'
import { localeToCountry } from '../utils/phone'

export interface CountrySuggestion {
  suggestedCountry: string | null
  suggestionReason: 'ip' | 'locale' | null
  dismissSuggestion: boolean
}

export interface CountryDetectionActions {
  setDismissSuggestion: (dismiss: boolean) => void
  applySuggestion: (country: string) => void
  dismissCountrySuggestion: () => void
}

/**
 * Fetches country from Cloudflare trace endpoint
 */
async function fetchCountryFromCloudflare(): Promise<string | null> {
  try {
    const resp = await fetch('/cdn-cgi/trace', { credentials: 'omit' })
    if (!resp.ok) return null
    const text = await resp.text()
    const line = text.split('\n').find((l) => l.startsWith('loc='))
    const iso = line ? line.split('=')[1]?.trim() : null
    return iso ? iso.toUpperCase() : null
  } catch {
    return null
  }
}

/**
 * Fetches country from IP API service
 */
async function fetchCountryFromIpApi(): Promise<string | null> {
  try {
    const resp = await fetch('https://ipapi.co/json/', { credentials: 'omit' })
    if (!resp.ok) return null
    const data = await resp.json()
    const iso = (data && (data.country || data.country_code)) as string | undefined
    return iso ? iso.toUpperCase() : null
  } catch {
    return null
  }
}

/**
 * Custom hook for country detection based on browser locale and IP
 */
export function useCountryDetection(
  defaultCountry: string,
  isReady: boolean
): [CountrySuggestion, CountryDetectionActions] {
  const [suggestedCountry, setSuggestedCountry] = useState<string | null>(null)
  const [suggestionReason, setSuggestionReason] = useState<'ip' | 'locale' | null>(null)
  const [dismissSuggestion, setDismissSuggestion] = useState<boolean>(false)

  // Load dismiss state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISS_COUNTRY_SUGGESTION)
      if (dismissed === '1') {
        setDismissSuggestion(true)
      }
    } catch (_) {
      // ignore localStorage errors
    }
  }, [])

  // Detect country from browser locale
  useEffect(() => {
    if (typeof window === 'undefined' || dismissSuggestion === true) return
    if (!isReady) return
    
    try {
      // Only suggest if user hasn't explicitly set a country before
      const hadStored = !!localStorage.getItem(STORAGE_KEYS.PHONE_COUNTRY)
      if (hadStored) return
      
      const locales = (navigator.languages && navigator.languages.length > 0) 
        ? navigator.languages 
        : [navigator.language]
        
      for (const loc of locales) {
        const country = localeToCountry(loc)
        if (country && country !== defaultCountry) {
          setSuggestedCountry(country)
          setSuggestionReason('locale')
          break
        }
      }
    } catch (_) {
      // ignore navigator errors
    }
  }, [dismissSuggestion, defaultCountry, isReady])

  // Detect country from IP/location
  useEffect(() => {
    if (typeof window === 'undefined' || dismissSuggestion === true) return
    if (!isReady) return
    
    // Only run if no stored country
    try {
      const hadStored = !!localStorage.getItem(STORAGE_KEYS.PHONE_COUNTRY)
      if (hadStored) return
    } catch (_) {}

    let cancelled = false

    const suggest = (country: string | null, reason: 'ip' | 'locale') => {
      if (cancelled || !country) return
      if (country !== defaultCountry) {
        setSuggestedCountry(country)
        setSuggestionReason(reason)
      }
    }

    const detectCountryFromIP = async () => {
      const cfCountry = await fetchCountryFromCloudflare()
      if (cfCountry) return suggest(cfCountry, 'ip')
      
      const apiCountry = await fetchCountryFromIpApi()
      if (apiCountry) return suggest(apiCountry, 'ip')
      
      // If both fail and we already had a locale suggestion, keep it; otherwise do nothing
    }

    detectCountryFromIP()

    return () => {
      cancelled = true
    }
  }, [dismissSuggestion, defaultCountry, isReady])

  const applySuggestion = (country: string) => {
    setDismissSuggestion(true)
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISS_COUNTRY_SUGGESTION, '1')
    } catch (_) {
      // ignore localStorage errors
    }
  }

  const dismissCountrySuggestion = () => {
    setDismissSuggestion(true)
    setSuggestedCountry(null)
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISS_COUNTRY_SUGGESTION, '1')
    } catch (_) {
      // ignore localStorage errors
    }
  }

  const suggestion: CountrySuggestion = {
    suggestedCountry,
    suggestionReason,
    dismissSuggestion,
  }

  const actions: CountryDetectionActions = {
    setDismissSuggestion,
    applySuggestion,
    dismissCountrySuggestion,
  }

  return [suggestion, actions]
}
