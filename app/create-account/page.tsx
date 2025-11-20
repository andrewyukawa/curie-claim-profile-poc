'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NPIMatch } from '@/types'

/**
 * Account creation screen - For verified users
 * Route: /create-account
 */
export default function CreateAccountPage() {
  const router = useRouter()
  const [verifiedData, setVerifiedData] = useState<NPIMatch | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve verified NPI data from sessionStorage
    const storedData = sessionStorage.getItem('verifiedNPIData')
    if (!storedData) {
      router.push('/lookup')
      return
    }

    try {
      const parsed = JSON.parse(storedData)
      setVerifiedData(parsed)
    } catch (err) {
      console.error('Error parsing verified data:', err)
      router.push('/lookup')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    if (usePassword && !password) {
      setError('Password is required')
      return
    }
    
    if (!verifiedData) {
      setError('Verification data missing')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: usePassword ? password : undefined,
          npiData: verifiedData,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }
      
      // Clear session storage
      sessionStorage.removeItem('npiMatches')
      sessionStorage.removeItem('selectedNPI')
      sessionStorage.removeItem('verifiedNPIData')
      
      // Navigate to success page
      router.push('/success?verified=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (!verifiedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 mb-6">
            Your identity has been verified. Just set up your account credentials.
          </p>
          
          {/* Display verified profile info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 mb-2 font-semibold">✓ Verified Profile</p>
            <p className="text-gray-900 font-medium">{verifiedData.name}</p>
            <p className="text-sm text-gray-600">{verifiedData.credential} • {verifiedData.taxonomy}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => setUsePassword(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Set a password (optional - magic link available)</span>
                </label>
                {usePassword && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
                    placeholder="Enter password"
                  />
                )}
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

