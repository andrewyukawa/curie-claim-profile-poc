import { NextRequest, NextResponse } from 'next/server'
import { fetchNPIByNumber, processNPIMatches } from '@/lib/npi'
import { generateKBAQuestions, verifyKBAAnswers } from '@/lib/kba'

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

/**
 * POST /api/verify
 * 
 * Verify user identity using KBA questions
 * 
 * Body: {
 *   selected_npi: string,
 *   answers: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selected_npi, answers } = body
    
    if (!selected_npi || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'selected_npi and answers array required' },
        { status: 400 }
      )
    }
    
    // Fetch the NPI record to generate questions
    const records = await fetchNPIByNumber(selected_npi)
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'NPI record not found' },
        { status: 404 }
      )
    }
    
    const record = records[0]
    const questions = await generateKBAQuestions(record)
    
    // Verify answers
    const isValid = verifyKBAAnswers(questions, answers)
    
    if (isValid) {
      // Return success with the NPI record data for account creation
      const matches = processNPIMatches([record])
      return NextResponse.json({
        success: true,
        npiData: matches[0],
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Verification failed',
      })
    }
  } catch (error) {
    console.error('Error in verification:', error)
    return NextResponse.json(
      { error: 'Verification failed', success: false },
      { status: 500 }
    )
  }
}

/**
 * GET /api/verify
 * 
 * Get KBA questions for a selected NPI
 * 
 * Query params: selected_npi
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const selectedNpi = searchParams.get('selected_npi')
    
    if (!selectedNpi) {
      return NextResponse.json(
        { error: 'selected_npi required' },
        { status: 400 }
      )
    }
    
    // Fetch the NPI record
    const records = await fetchNPIByNumber(selectedNpi)
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'NPI record not found' },
        { status: 404 }
      )
    }
    
    const record = records[0]
    const questions = await generateKBAQuestions(record)
    
    // Return questions without correct answers (for security)
    const questionsForClient = questions.map(q => ({
      question: q.question,
      options: q.options,
    }))
    
    return NextResponse.json({ questions: questionsForClient })
  } catch (error) {
    console.error('Error generating KBA questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate verification questions' },
      { status: 500 }
    )
  }
}

