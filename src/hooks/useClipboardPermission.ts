import { useState, useEffect, useCallback } from 'react'

export interface ClipboardPermissionState {
  permissionStatus: PermissionState | null
  isSupported: boolean
  isLoading: boolean
}

export interface ClipboardPermissionActions {
  checkPermission: () => Promise<void>
  refreshPermission: () => Promise<void>
}

/**
 * Custom hook for checking and managing clipboard read permissions
 */
export function useClipboardPermission(): ClipboardPermissionState & ClipboardPermissionActions {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Check if clipboard API is supported
   */
  const checkClipboardSupport = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }
    
    return !!(
      'clipboard' in navigator &&
      'readText' in navigator.clipboard &&
      'permissions' in navigator
    )
  }

  /**
   * Query clipboard permission status with timeout
   */
  const queryPermission = async (): Promise<PermissionState | null> => {
    if (!isSupported) return null

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Permission query timeout')), 5000)
      )
      
      const permissionPromise = navigator.permissions.query({ 
        name: 'clipboard-read' as PermissionName 
      })
      
      const permission = await Promise.race([permissionPromise, timeoutPromise])
      return permission.state
    } catch (error) {
      console.warn('Failed to query clipboard permission:', error)
      return null
    }
  }

  /**
   * Attempt to read clipboard to trigger permission request with timeout
   */
  const triggerPermissionRequest = async (): Promise<PermissionState | null> => {
    if (!isSupported) return null

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Clipboard read timeout')), 5000)
      )
      
      const clipboardPromise = navigator.clipboard.readText()
      
      // Attempt to read clipboard - this will trigger permission request if needed
      await Promise.race([clipboardPromise, timeoutPromise])
      // If successful, permission is granted
      return 'granted'
    } catch (error) {
      // Check if it's a permission error
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          return 'denied'
        }
      }
      console.warn('Clipboard read failed:', error)
      return null
    }
  }

  /**
   * Check permission by querying and optionally triggering request
   */
  const checkPermission = useCallback(async (): Promise<void> => {
    if (!isSupported) return

    setIsLoading(true)
    
    try {
      // First try to query permission status
      let status = await queryPermission()
      
      // If we can't get status or it's prompt, try to trigger the permission request
      if (status === null || status === 'prompt') {
        const triggeredStatus = await triggerPermissionRequest()
        if (triggeredStatus) {
          status = triggeredStatus
        }
      }
      
      setPermissionStatus(status)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  /**
   * Refresh permission status without triggering new requests
   */
  const refreshPermission = useCallback(async (): Promise<void> => {
    if (!isSupported) return

    setIsLoading(true)
    
    try {
      const status = await queryPermission()
      setPermissionStatus(status)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Initialize clipboard support check and permission status
  useEffect(() => {
    const supported = checkClipboardSupport()
    setIsSupported(supported)

    if (supported) {
      // Automatically check permission status on initialization with additional safety timeout
      const safetyTimeout = setTimeout(() => {
        console.warn('Permission check timeout - forcing loading state to false')
        setIsLoading(false)
      }, 10000) // 10 second fallback timeout

      checkPermission().finally(() => {
        clearTimeout(safetyTimeout)
      })
    } else {
      setIsLoading(false)
    }
  }, [checkPermission]) // checkPermission is stable due to useCallback

  // Listen for permission changes
  useEffect(() => {
    if (!isSupported) return

    const handlePermissionChange = (event: Event) => {
      const permission = event.target as PermissionStatus
      setPermissionStatus(permission.state)
    }

    let permissionStatus: PermissionStatus | null = null

    const setupPermissionListener = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ 
          name: 'clipboard-read' as PermissionName 
        })
        permissionStatus.addEventListener('change', handlePermissionChange)
      } catch (error) {
        console.warn('Failed to set up permission listener:', error)
      }
    }

    setupPermissionListener()

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handlePermissionChange)
      }
    }
  }, [isSupported])

  return {
    permissionStatus,
    isSupported,
    isLoading,
    checkPermission,
    refreshPermission
  }
}
