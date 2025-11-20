import { NextRequest, NextResponse } from 'next/server'
import { saveAccount, emailExists } from '@/lib/storage'
import { Account } from '@/types'

/**
 * POST /api/manual-create
 * 
 * Create an unverified account manually (fallback flow)
 * 
 * Body: {
 *   name: string,
 *   degree: string,
 *   specialty: string,
 *   email: string,
 *   password?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, degree, specialty, email, password } = body
    
    if (!name || !degree || !specialty || !email) {
      return NextResponse.json(
        { error: 'name, degree, specialty, and email are required' },
        { status: 400 }
      )
    }
    
    // Check if email already exists
    if (emailExists(email)) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create unverified account
    const account: Account = {
      email,
      password: password || undefined,
      verified: false,
      name,
      degree,
      taxonomy: specialty,
      practice_location: 'Not specified',
      created_at: new Date().toISOString(),
    }
    
    // Save to storage
    saveAccount(account)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating manual account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

