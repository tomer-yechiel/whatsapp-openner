import React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { CountryCode } from 'libphonenumber-js'
import { usePhoneInput } from '../hooks/usePhoneInput'
import { useCountryDetection } from '../hooks/useCountryDetection'
import { useClipboardDetection } from '../hooks/useClipboardDetection'
import { CountrySuggestion } from './CountrySuggestion'
import { ClipboardModal } from './ClipboardModal'
import { getFullDigits, openWhatsApp } from '../utils/phone'

/**
 * Main phone input form component with validation and WhatsApp integration
 */
export function PhoneInputForm() {
  // Phone input state and actions
  const [phoneState, phoneActions] = usePhoneInput()
  const { value, error, defaultCountry, isReady } = phoneState
  const { handlePhoneChange, setDefaultCountry, setError } = phoneActions

  // Country detection state and actions
  const [countrySuggestion, countryActions] = useCountryDetection(defaultCountry, isReady)
  const { suggestedCountry, suggestionReason, dismissSuggestion } = countrySuggestion
  const { applySuggestion, dismissCountrySuggestion } = countryActions

  // Clipboard detection state and actions
  const [clipboardState, clipboardActions] = useClipboardDetection(value)
  const { isModalOpen, clipboardCandidates } = clipboardState
  const { selectCandidate, closeModal } = clipboardActions

  // Handle country suggestion application
  const handleApplySuggestion = (country: string) => {
    setDefaultCountry(country as CountryCode)
    applySuggestion(country)
  }

  // Handle clipboard candidate selection
  const handleCandidateSelection = (candidate: string, detectedCountry?: string) => {
    handlePhoneChange(candidate)
    if (detectedCountry) {
      setDefaultCountry(detectedCountry as CountryCode)
    }
  }

  // Handle WhatsApp button click
  const handleOpenWhatsApp = () => {
    openWhatsApp(value, setError)
  }

  // Calculate if WhatsApp can be opened
  const digitsOnly = getFullDigits(value)
  const canOpen = !error && digitsOnly.length >= 7

  return (
    <div className="mt-4 max-w-sm">
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Phone Number
      </label>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Enter manually or import from clipboard
      </p>
      
      <div className="mt-3">
        <PhoneInput
          placeholder="Enter phone number"
          value={value}
          onChange={handlePhoneChange}
          defaultCountry={defaultCountry}
          className="
            w-full 
            [&_.PhoneInputInput]:w-full 
            [&_.PhoneInputInput]:rounded-md 
            [&_.PhoneInputInput]:border 
            [&_.PhoneInputInput]:border-gray-300 
            [&_.PhoneInputInput]:bg-white 
            [&_.PhoneInputInput]:px-3 
            [&_.PhoneInputInput]:py-2 
            [&_.PhoneInputInput]:text-sm 
            [&_.PhoneInputInput]:text-gray-900 
            [&_.PhoneInputInput]:placeholder-gray-500 
            [&_.PhoneInputInput]:shadow-sm 
            [&_.PhoneInputInput]:transition-colors 
            [&_.PhoneInputInput]:focus:border-blue-500 
            [&_.PhoneInputInput]:focus:outline-none 
            [&_.PhoneInputInput]:focus:ring-1 
            [&_.PhoneInputInput]:focus:ring-blue-500
            [&_.PhoneInputCountrySelect]:rounded-l-md 
            [&_.PhoneInputCountrySelect]:border 
            [&_.PhoneInputCountrySelect]:border-r-0 
            [&_.PhoneInputCountrySelect]:border-gray-300 
            [&_.PhoneInputCountrySelect]:bg-gray-50 
            [&_.PhoneInputCountrySelect]:px-3 
            [&_.PhoneInputCountrySelect]:py-2 
            [&_.PhoneInputCountrySelect]:text-sm 
            [&_.PhoneInputCountrySelect]:transition-colors 
            [&_.PhoneInputCountrySelect]:hover:bg-gray-100 
            [&_.PhoneInputCountrySelect]:focus:border-blue-500 
            [&_.PhoneInputCountrySelect]:focus:outline-none 
            [&_.PhoneInputCountrySelect]:focus:ring-1 
            [&_.PhoneInputCountrySelect]:focus:ring-blue-500
            dark:[&_.PhoneInputInput]:border-gray-600 
            dark:[&_.PhoneInputInput]:bg-gray-800 
            dark:[&_.PhoneInputInput]:text-gray-100 
            dark:[&_.PhoneInputInput]:placeholder-gray-400 
            dark:[&_.PhoneInputInput]:focus:border-blue-400 
            dark:[&_.PhoneInputInput]:focus:ring-blue-400
            dark:[&_.PhoneInputCountrySelect]:border-gray-600 
            dark:[&_.PhoneInputCountrySelect]:bg-gray-700 
            dark:[&_.PhoneInputCountrySelect]:text-gray-100 
            dark:[&_.PhoneInputCountrySelect]:hover:bg-gray-600 
            dark:[&_.PhoneInputCountrySelect]:focus:border-blue-400 
            dark:[&_.PhoneInputCountrySelect]:focus:ring-blue-400
          "
        />
      </div>

      {/* Country suggestion banner */}
      {suggestedCountry && !dismissSuggestion && suggestedCountry !== defaultCountry && (
        <CountrySuggestion
          suggestedCountry={suggestedCountry}
          suggestionReason={suggestionReason}
          onApply={handleApplySuggestion}
          onDismiss={dismissCountrySuggestion}
        />
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      

      {/* WhatsApp button */}
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        disabled={!canOpen}
        className={`mt-3 inline-flex items-center rounded bg-green-500 px-4 py-2 text-white transition-colors ${
          canOpen ? 'hover:bg-green-600 focus:bg-green-600' : 'opacity-50 cursor-not-allowed'
        }`}
        aria-label="Open WhatsApp chat with the entered phone number"
        title={canOpen ? 'Open WhatsApp' : 'Enter a valid phone number to continue'}
      >
        Open WhatsApp Chat
      </button>

      {/* Clipboard modal */}
      <ClipboardModal
        isOpen={isModalOpen}
        candidates={clipboardCandidates}
        onSelectCandidate={(candidate) => selectCandidate(candidate, handleCandidateSelection)}
        onClose={closeModal}
      />
    </div>
  )
}
