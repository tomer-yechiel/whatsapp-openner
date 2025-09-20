import { createFileRoute, Link } from '@tanstack/react-router'
import { PhoneInputForm } from '../components/PhoneInputForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* GitHub repository link - fixed to viewport top-right */}
      <a
        href="https://github.com/tomer-yechiel/whatsapp-openner"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 transition-colors shadow-md"
        title="View source code on GitHub"
        aria-label="View source code on GitHub"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      </a>

      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <header className="mb-4 text-center relative">
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Chat Opener</h1>
          <p className="mt-1 text-sm text-gray-600">Enter a phone number and jump straight into a chat</p>
          
          {/* Settings button */}
          <Link
            to="/settings"
            className="absolute top-0 right-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 transition-colors"
            title="Settings"
            aria-label="Go to settings"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </header>
        <PhoneInputForm />
      </div>
    </div>
  )
}
