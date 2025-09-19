import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useClipboardPermission } from '../hooks/useClipboardPermission'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const { permissionStatus, isSupported, isLoading, checkPermission } = useClipboardPermission()

  const getPermissionStatusText = () => {
    if (!isSupported) {
      return 'Clipboard API is not supported in this browser'
    }
    
    if (isLoading) {
      return 'Checking permission...'
    }
    
    switch (permissionStatus) {
      case 'granted':
        return 'Clipboard read access is allowed'
      case 'denied':
        return 'Clipboard read access is denied'
      case 'prompt':
        return 'Clipboard read access will prompt for permission'
      default:
        return 'Clipboard permission status unknown'
    }
  }

  const getPermissionStatusColor = () => {
    if (!isSupported) {
      return 'text-gray-500'
    }
    
    if (isLoading) {
      return 'text-blue-600'
    }
    
    switch (permissionStatus) {
      case 'granted':
        return 'text-green-600'
      case 'denied':
        return 'text-red-600'
      case 'prompt':
        return 'text-yellow-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">App preferences and permissions</p>
        </header>

        <div className="space-y-6">
          {/* Clipboard Permission Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Clipboard Access</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Permission Status:</span>
                <span className={`text-sm font-medium ${getPermissionStatusColor()}`}>
                  {getPermissionStatusText()}
                </span>
              </div>
              
              {isSupported && (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    This app can detect phone numbers in your clipboard to help you quickly 
                    input them. The clipboard is only read when you focus the app window.
                  </p>
                  {permissionStatus !== 'granted' && !isLoading && (
                    <button
                      onClick={checkPermission}
                      className="inline-flex items-center rounded bg-blue-500 px-3 py-1 text-white text-xs hover:bg-blue-600 focus:bg-blue-600 transition-colors"
                    >
                      Check Permission
                    </button>
                  )}
                </div>
              )}
              
              {!isSupported && (
                <div className="text-sm text-gray-600">
                  <p>
                    Your browser doesn't support the Clipboard API. Automatic phone number 
                    detection from clipboard won't work.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
