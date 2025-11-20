import { NPIRecord, KBAQuestion } from '@/types'

/**
 * Generate realistic fake addresses for KBA wrong options
 */
function generateFakeAddresses(): string[] {
  const fakeAddresses = [
    '1234 Medical Center Dr, New York, NY 10001',
    '567 Healthcare Blvd, Los Angeles, CA 90210',
    '890 Clinic Ave, Chicago, IL 60601',
    '2345 Hospital Way, Houston, TX 77001',
    '678 Wellness St, Phoenix, AZ 85001',
    '901 Practice Ln, Philadelphia, PA 19101',
    '1122 Doctor Dr, San Antonio, TX 78201',
    '3344 Health Plaza, San Diego, CA 92101',
    '5566 Medical Park, Dallas, TX 75201',
    '7788 Care Center Rd, San Jose, CA 95101',
    '9900 Physician Way, Austin, TX 73301',
    '1357 Treatment Blvd, Jacksonville, FL 32099',
    '2468 Therapy St, Fort Worth, TX 76101',
    '3691 Healing Ave, Columbus, OH 43085',
    '4820 Medicine Dr, Charlotte, NC 28201',
    '5173 Specialty Ln, San Francisco, CA 94102',
    '6284 Emergency Way, Indianapolis, IN 46201',
    '7395 Surgery St, Seattle, WA 98101',
    '8406 Radiology Rd, Denver, CO 80201',
    '9517 Cardiology Ct, Washington, DC 20001'
  ]
  
  // Shuffle and return
  return fakeAddresses.sort(() => Math.random() - 0.5)
}

/**
 * Generate KBA (Knowledge-Based Authentication) questions from an NPI record
 * These are lightweight verification questions based on the NPI data
 */
export function generateKBAQuestions(record: NPIRecord): KBAQuestion[] {
  const questions: KBAQuestion[] = []
  
  // Question 1: Practice location (specific address)
  const practiceAddresses = record.addresses?.filter(
    addr => addr.address_purpose === 'LOCATION'
  ) || []
  
  if (practiceAddresses.length > 0) {
    const correctLocation = practiceAddresses[0]
    // Format full address: "123 Main St, Seattle, WA 98104"
    let correctAnswer = correctLocation.address_1
    if (correctLocation.address_2) {
      correctAnswer += `, ${correctLocation.address_2}`
    }
    correctAnswer += `, ${correctLocation.city}, ${correctLocation.state} ${correctLocation.postal_code}`
    
    // Generate plausible wrong address options
    const wrongOptions = generateFakeAddresses().filter(opt => opt !== correctAnswer)
    
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

