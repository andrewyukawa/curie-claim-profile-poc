'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NPIMatch } from '@/types'

/**
 * Match selection screen - Display search results and let user select their profile
 * Route: /select
 */
export default function SelectPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<NPIMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve matches from sessionStorage
    const storedMatches = sessionStorage.getItem('npiMatches')
    if (storedMatches) {
      try {
        const parsed = JSON.parse(storedMatches)
        setMatches(parsed)
      } catch (err) {
        console.error('Error parsing matches:', err)
      }
    }
    setLoading(false)
  }, [])

  const handleSelect = (match: NPIMatch) => {
    // Store selected match for verification
    sessionStorage.setItem('selectedNPI', JSON.stringify(match))
    router.push('/verify')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Matches Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find a profile matching your search. You can create your Curie account manually instead.
            </p>
            <button
              onClick={() => router.push('/manual')}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create My Curie Account Manually Instead
            </button>
            <button
              onClick={() => router.push('/lookup')}
              className="w-full mt-4 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Try Another Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Select Your Profile
          </h1>
          <p className="text-gray-600 mb-6">
            We found {matches.length} {matches.length === 1 ? 'match' : 'matches'}. Please select the one that's yours:
          </p>
          
          <div className="space-y-4 mb-6">
            {matches.map((match) => (
              <div
                key={match.npi}
                className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelect(match)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {match.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Credential:</span> {match.credential}
                      </div>
                      <div>
                        <span className="font-medium">Specialty:</span> {match.taxonomy}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {match.practiceLocation}
                      </div>
                      <div>
                        <span className="font-medium">NPI:</span> {match.npi}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(match)
                    }}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    This is me
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/manual')}
              className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Create My Curie Account Manually Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

