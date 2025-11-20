import { NextRequest, NextResponse } from 'next/server'
import { fetchNPIByNumber, fetchNPIByName, processNPIMatches } from '@/lib/npi'

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

/**
 * GET /api/npi-lookup
 * 
 * Search the NPI Registry by either:
 * - NPI number (10 digits)
 * - Name (first_name, last_name, state)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const npi = searchParams.get('npi')
    const firstName = searchParams.get('first_name')
    const lastName = searchParams.get('last_name')
    const state = searchParams.get('state')
    
    let records
    
    // Search by NPI number
    if (npi) {
      if (!/^\d{10}$/.test(npi)) {
        return NextResponse.json(
          { error: 'NPI must be exactly 10 digits' },
          { status: 400 }
        )
      }
      records = await fetchNPIByNumber(npi)
    }
    // Search by name
    else if (firstName && lastName) {
      records = await fetchNPIByName(firstName, lastName, state || undefined)
    }
    else {
      return NextResponse.json(
        { error: 'Either NPI number or first_name + last_name required' },
        { status: 400 }
      )
    }
    
    // Process records into simplified matches
    const matches = processNPIMatches(records)
    
    return NextResponse.json({ matches }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in NPI lookup:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to search NPI registry'
    return NextResponse.json(
      { error: errorMessage, matches: [] },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

