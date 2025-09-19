import React from 'react'
import { getFullDigits } from '../utils/phone'

interface ClipboardModalProps {
  isOpen: boolean
  candidates: string[]
  onSelectCandidate: (candidate: string) => void
  onClose: () => void
}

/**
 * Modal component for selecting phone numbers from clipboard
 */
export function ClipboardModal({
  isOpen,
  candidates,
  onSelectCandidate,
  onClose,
}: ClipboardModalProps) {
  if (!isOpen) return null

  return (
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
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <p className="mb-2 text-sm text-gray-600">Select a number to fill the input:</p>
        
        <ul className="max-h-60 space-y-2 overflow-auto">
          {candidates.map((candidate, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onSelectCandidate(candidate)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-left hover:bg-gray-50"
              >
                {candidate}{' '}
                <span className="ml-2 text-xs text-gray-500">
                  (digits: {getFullDigits(candidate)})
                </span>
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
