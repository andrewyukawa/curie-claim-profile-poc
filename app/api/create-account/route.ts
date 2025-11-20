import { NextRequest, NextResponse } from 'next/server'
import { saveAccount, emailExists } from '@/lib/storage'
import { Account } from '@/types'

/**
 * POST /api/create-account
 * 
 * Create a verified account after successful NPI verification
 * 
 * Body: {
 *   email: string,
 *   password?: string,
 *   npiData: {
 *     npi: string,
 *     name: string,
 *     credential: string,
 *     taxonomy: string,
 *     practiceLocation: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, npiData } = body
    
    if (!email || !npiData) {
      return NextResponse.json(
        { error: 'email and npiData required' },
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
    
    // Create account object
    const account: Account = {
      email,
      password: password || undefined,
      npi: npiData.npi,
      verified: true,
      name: npiData.name,
      degree: npiData.credential,
      taxonomy: npiData.taxonomy,
      practice_location: npiData.practiceLocation,
      created_at: new Date().toISOString(),
    }
    
    // Save to storage
    saveAccount(account)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

