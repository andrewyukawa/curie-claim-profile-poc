'use client'

import { useRouter } from 'next/navigation'

/**
 * Landing screen - Entry point for the claim profile flow
 * Route: /claim
 */
export default function ClaimPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Claim Your Curie Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Verify your identity and unlock exclusive features designed for healthcare professionals.
          </p>
          <button
            onClick={() => router.push('/lookup')}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

