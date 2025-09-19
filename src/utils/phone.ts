import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { MIN_PHONE_DIGITS } from '../constants/phone'

/**
 * Converts a locale string to a country code
 * @param locale - Locale string like 'en-US', 'en_US', 'en', 'zh-Hant-TW'
 * @returns Country code in uppercase or null if not found
 */
export function localeToCountry(locale?: string | null): string | null {
  if (!locale) return null
  // Locale formats: en-US, en_US, en, zh-Hant-TW
  const parts = locale.replace('_', '-').split('-')
  const likelyCountry = parts.find((p) => p.length === 2 && /[A-Za-z]{2}/.test(p))
  return likelyCountry ? likelyCountry.toUpperCase() : null
}

/**
 * Extracts full digits from a phone number string
 * @param value - Phone number string
 * @returns String with only digits
 */
export function getFullDigits(value?: string): string {
  if (!value) return ''
  // react-phone-number-input already provides E.164 format
  return value.replace(/\D/g, '')
}

/**
 * Validates a phone number and returns validation result
 * @param phoneValue - Phone number string to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePhoneNumber(phoneValue?: string): { isValid: boolean; error: string | null } {
  if (!phoneValue) {
    return { isValid: true, error: null }
  }

  try {
    if (isValidPhoneNumber(phoneValue)) {
      return { isValid: true, error: null }
    } else {
      // For E.164 numbers, basic length check
      const digits = phoneValue.replace(/\D/g, '')
      if (digits.length >= MIN_PHONE_DIGITS) {
        return { isValid: true, error: null } // Allow potentially valid numbers
      } else {
        return { isValid: false, error: `Please enter at least ${MIN_PHONE_DIGITS} digits` }
      }
    }
  } catch {
    const digits = phoneValue.replace(/\D/g, '')
    if (digits.length >= MIN_PHONE_DIGITS) {
      return { isValid: true, error: null }
    } else {
      return { isValid: false, error: `Please enter at least ${MIN_PHONE_DIGITS} digits` }
    }
  }
}

/**
 * Sanitizes a phone number string by removing invalid characters
 * @param phone - Raw phone number string
 * @returns Cleaned phone number string
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove everything except digits, +, spaces, parentheses, dots, and hyphens
  return phone.replace(/[^\d+\s().-]/g, '').trim()
}

/**
 * Extracts potential phone number candidates from text
 * @param text - Text to search for phone numbers
 * @returns Array of potential phone number strings
 */
export function extractPhoneCandidates(text: string): string[] {
  const phoneLikeRegex = /\+?\d[\d\s().-]{5,}\d/g // at least 7 digits overall with allowed separators
  const matches = text.match(phoneLikeRegex) || []
  const cleaned = matches
    .map((m) => sanitizePhoneNumber(m))
    .map((m) => m.trim())
    .filter(Boolean)

  const seen = new Set<string>()
  const result: string[] = []
  
  for (const candidate of cleaned) {
    try {
      // Try to parse with libphonenumber-js for validation
      if (isValidPhoneNumber(candidate)) {
        const parsed = parsePhoneNumber(candidate)
        const formattedNumber = parsed.formatInternational()
        const digits = parsed.number.replace(/\D/g, '')
        if (digits.length >= MIN_PHONE_DIGITS && !seen.has(digits)) {
          seen.add(digits)
          result.push(formattedNumber)
        }
      } else {
        // Fallback to original logic for numbers that might be valid but not perfectly formatted
        const digits = candidate.replace(/\D/g, '')
        if (digits.length >= MIN_PHONE_DIGITS && !seen.has(digits)) {
          seen.add(digits)
          result.push(candidate)
        }
      }
    } catch {
      // If parsing fails, use original logic
      const digits = candidate.replace(/\D/g, '')
      if (digits.length >= MIN_PHONE_DIGITS && !seen.has(digits)) {
        seen.add(digits)
        result.push(candidate)
      }
    }
  }
  
  return result
}

/**
 * Opens WhatsApp with the given phone number
 * @param phoneValue - Phone number string
 * @param onError - Callback for handling errors
 */
export function openWhatsApp(phoneValue?: string, onError?: (error: string) => void): void {
  const digits = getFullDigits(phoneValue)
  if (!digits || digits.length < MIN_PHONE_DIGITS) {
    onError?.(`Please enter at least ${MIN_PHONE_DIGITS} digits`)
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
