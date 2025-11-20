'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NPIMatch } from '@/types'

interface Question {
  question: string
  options: string[]
}

/**
 * Identity verification screen - KBA questions
 * Route: /verify
 */
export default function VerifyPage() {
  const router = useRouter()
  const [selectedNPI, setSelectedNPI] = useState<NPIMatch | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve selected NPI from sessionStorage
    const storedNPI = sessionStorage.getItem('selectedNPI')
    if (!storedNPI) {
      router.push('/lookup')
      return
    }

    try {
      const parsed = JSON.parse(storedNPI)
      setSelectedNPI(parsed)
      loadQuestions(parsed.npi)
    } catch (err) {
      console.error('Error parsing selected NPI:', err)
      router.push('/lookup')
    }
  }, [router])

  const loadQuestions = async (npi: string) => {
    try {
      const response = await fetch(`/api/verify?selected_npi=${npi}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load questions')
      }
      
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification questions')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answer
    setAnswers(newAnswers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if all questions are answered
    if (answers.some(a => !a)) {
      setError('Please answer all questions')
      return
    }
    
    if (!selectedNPI) {
      setError('No profile selected')
      return
    }
    
    setVerifying(true)
    setError(null)
    
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_npi: selectedNPI.npi,
          answers,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store verified NPI data for account creation
        sessionStorage.setItem('verifiedNPIData', JSON.stringify(data.npiData))
        router.push('/create-account')
      } else {
        setError('Verification failed. Please try again or create your account manually.')
      }
    } catch (err) {
      setError('An error occurred during verification')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading verification questions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-600 mb-6">
            Please answer these questions to verify that this profile belongs to you.
          </p>
          
          {selectedNPI && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Verifying profile for:</p>
              <p className="font-semibold text-gray-900">{selectedNPI.name}</p>
              <p className="text-sm text-gray-600">NPI: {selectedNPI.npi}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {q.question}
                  </h3>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={option}
                          checked={answers[qIndex] === option}
                          onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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
                disabled={verifying}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/manual')}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Skip verification and create account manually instead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

