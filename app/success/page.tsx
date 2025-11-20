'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

/**
 * Success/confirmation screen - Shows after account creation
 * Route: /success
 */
function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const verifiedParam = searchParams.get('verified')
    setVerified(verifiedParam === 'true')
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account Created Successfully!
          </h1>
          
          {verified ? (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Your Curie profile has been verified and your account is ready to use.
              </p>
              <p className="text-sm text-green-600 font-medium">
                ✓ Identity Verified
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Your Curie account has been created successfully.
              </p>
              <p className="text-sm text-gray-500">
                You can verify your profile later to unlock additional features.
              </p>
            </div>
          )}
          
          <div>
            <button
              onClick={() => router.push('/claim')}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

