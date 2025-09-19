// Phone number related constants

/**
 * Map dial codes to country codes for react-phone-number-input
 */
export const DIAL_TO_COUNTRY: Record<string, string> = {
  '+1': 'US', '+44': 'GB', '+972': 'IL', '+91': 'IN', '+49': 'DE', '+33': 'FR', '+55': 'BR', '+61': 'AU',
  '+52': 'MX', '+27': 'ZA', '+81': 'JP', '+34': 'ES', '+39': 'IT', '+7': 'RU', '+86': 'CN', '+353': 'IE', 
  '+31': 'NL', '+41': 'CH', '+46': 'SE', '+47': 'NO', '+48': 'PL', '+43': 'AT', '+32': 'BE', '+351': 'PT', 
  '+90': 'TR', '+62': 'ID', '+63': 'PH', '+64': 'NZ', '+82': 'KR', '+60': 'MY', '+20': 'EG', '+971': 'AE',
  '+966': 'SA', '+965': 'KW', '+974': 'QA', '+968': 'OM', '+973': 'BH', '+98': 'IR', '+212': 'MA', 
  '+56': 'CL', '+57': 'CO', '+58': 'VE', '+54': 'AR', '+51': 'PE'
}

/**
 * Minimum number of digits required for a valid phone number
 */
export const MIN_PHONE_DIGITS = 7

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  PHONE_INPUT: 'phoneInput',
  PHONE_COUNTRY: 'phoneCountry',
  DISMISS_COUNTRY_SUGGESTION: 'dismissCountrySuggestion',
} as const

/**
 * Country detection timeout (ms)
 */
export const COUNTRY_DETECTION_TIMEOUT = 1500
