import { NPIRecord, KBAQuestion } from '@/types'

/**
 * Generate KBA (Knowledge-Based Authentication) questions from an NPI record
 * These are lightweight verification questions based on the NPI data
 */
export function generateKBAQuestions(record: NPIRecord): KBAQuestion[] {
  const questions: KBAQuestion[] = []
  
  // Question 1: Practice location
  const practiceAddresses = record.addresses?.filter(
    addr => addr.address_purpose === 'LOCATION'
  ) || []
  
  if (practiceAddresses.length > 0) {
    const correctLocation = practiceAddresses[0]
    const correctAnswer = `${correctLocation.city}, ${correctLocation.state}`
    
    // Generate some plausible wrong answers
    const wrongOptions = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
    ].filter(opt => opt !== correctAnswer)
    
    questions.push({
      question: 'Which of these locations have you practiced at?',
      options: [correctAnswer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
      correctAnswer,
    })
  }
  
  // Question 2: Taxonomy/Specialty
  const primaryTaxonomy = record.taxonomies?.find(t => t.primary) || record.taxonomies?.[0]
  if (primaryTaxonomy) {
    const correctAnswer = primaryTaxonomy.desc
    
    // Generate plausible wrong answers
    const wrongOptions = [
      'Internal Medicine',
      'Family Practice',
      'Emergency Medicine',
      'Pediatrics',
      'Cardiology',
    ].filter(opt => opt !== correctAnswer)
    
    questions.push({
      question: 'What is your primary medical specialty?',
      options: [correctAnswer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
      correctAnswer,
    })
  }
  
  // If we don't have enough questions, add a credential question
  if (questions.length < 2 && record.basic.credential) {
    const correctAnswer = record.basic.credential
    const wrongOptions = ['MD', 'DO', 'NP', 'PA', 'PharmD'].filter(opt => opt !== correctAnswer)
    
    questions.push({
      question: 'What is your professional credential?',
      options: [correctAnswer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
      correctAnswer,
    })
  }
  
  return questions.slice(0, 2) // Return max 2 questions
}

/**
 * Verify KBA answers
 */
export function verifyKBAAnswers(
  questions: KBAQuestion[],
  answers: string[]
): boolean {
  if (answers.length !== questions.length) {
    return false
  }
  
  // User needs to get at least one question right (lightweight verification)
  const correctCount = questions.filter((q, idx) => {
    return answers[idx] === q.correctAnswer
  }).length
  
  // For POC, accept if at least 1 out of 2 is correct
  return correctCount >= 1
}

