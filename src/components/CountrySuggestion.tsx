import React from 'react'

interface CountrySuggestionProps {
  suggestedCountry: string
  suggestionReason: 'ip' | 'locale' | null
  onApply: (country: string) => void
  onDismiss: () => void
}

/**
 * Country suggestion banner component
 */
export function CountrySuggestion({
  suggestedCountry,
  suggestionReason,
  onApply,
  onDismiss,
}: CountrySuggestionProps) {
  return (
    <div className="mt-2 flex items-center justify-between rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
      <div>
        Suggested country: <span className="font-medium">{suggestedCountry}</span>
        {suggestionReason ? (
          <span className="ml-1 text-blue-700">
            (based on {suggestionReason === 'ip' ? 'your IP/location' : 'your browser locale'})
          </span>
        ) : null}
      </div>
      <div className="ml-3 flex gap-2">
        <button
          type="button"
          className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
          onClick={() => onApply(suggestedCountry)}
        >
          Apply
        </button>
        <button
          type="button"
          className="rounded border border-blue-300 px-2 py-1 text-blue-800 hover:bg-blue-100"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
