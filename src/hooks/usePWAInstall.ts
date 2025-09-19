import { useState, useEffect, useCallback } from 'react'

// Extend the Window interface to include the beforeinstallprompt event
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent
  }
}

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface PWAInstallState {
  isInstallable: boolean
  isInstalled: boolean
  isSupported: boolean
  isLoading: boolean
  installPromptAvailable: boolean
}

export interface PWAInstallActions {
  promptInstall: () => Promise<boolean>
  checkInstallStatus: () => void
}

/**
 * Custom hook for managing PWA installation detection and prompts
 */
export function usePWAInstall(): PWAInstallState & PWAInstallActions {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  /**
   * Check if PWA installation is supported
   */
  const checkPWASupport = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }
    
    return !!(
      'serviceWorker' in navigator &&
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches !== undefined
    )
  }

  /**
   * Check if PWA is already installed
   */
  const checkIfInstalled = (): boolean => {
    if (typeof window === 'undefined') return false
    
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Check for iOS Safari standalone mode
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    return isStandalone || isIOSStandalone
  }

  /**
   * Trigger the PWA install prompt
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt || !installPromptAvailable) {
      console.warn('PWA install prompt is not available')
      return false
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user's choice
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt')
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPromptAvailable(false)
        setDeferredPrompt(null)
        return true
      } else {
        console.log('User dismissed the PWA install prompt')
        return false
      }
    } catch (error) {
      console.error('Error during PWA installation:', error)
      return false
    }
  }, [deferredPrompt, installPromptAvailable])

  /**
   * Check current install status
   */
  const checkInstallStatus = useCallback((): void => {
    const installed = checkIfInstalled()
    setIsInstalled(installed)
    
    // If already installed, it's not installable
    if (installed) {
      setIsInstallable(false)
      setInstallPromptAvailable(false)
    }
  }, [])

  // Initialize PWA support check and install status
  useEffect(() => {
    const supported = checkPWASupport()
    setIsSupported(supported)
    
    if (supported) {
      checkInstallStatus()
    }
    
    setIsLoading(false)
  }, [checkInstallStatus])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (!isSupported) return

    const handleBeforeInstallPrompt = (event: Event) => {
      const beforeInstallPromptEvent = event as BeforeInstallPromptEvent
      
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault()
      
      // Save the event so it can be triggered later
      setDeferredPrompt(beforeInstallPromptEvent)
      setIsInstallable(true)
      setInstallPromptAvailable(true)
      
      // Store it globally for potential use elsewhere
      window.deferredPrompt = beforeInstallPromptEvent
    }

    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPromptAvailable(false)
      setDeferredPrompt(null)
      window.deferredPrompt = undefined
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isSupported])

  // Listen for display mode changes
  useEffect(() => {
    if (!isSupported) return

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    
    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      const installed = event.matches || (window.navigator as any).standalone === true
      setIsInstalled(installed)
      
      if (installed) {
        setIsInstallable(false)
        setInstallPromptAvailable(false)
      }
    }

    // Check if the browser supports addEventListener on MediaQueryList
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange)
      return () => mediaQuery.removeEventListener('change', handleDisplayModeChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange)
      return () => mediaQuery.removeListener(handleDisplayModeChange)
    }
  }, [isSupported])

  return {
    isInstallable,
    isInstalled,
    isSupported,
    isLoading,
    installPromptAvailable,
    promptInstall,
    checkInstallStatus
  }
}
