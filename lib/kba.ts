import { NPIRecord, KBAQuestion } from '@/types'

/**
 * Format an address in consistent sentence case
 */
function formatAddress(address: NPIRecord['addresses'][0]): string {
  let formattedAddress = toSentenceCase(address.address_1)
  
  if (address.address_2) {
    formattedAddress += `, ${toSentenceCase(address.address_2)}`
  }
  
  formattedAddress += `, ${toSentenceCase(address.city)}, ${address.state} ${address.postal_code}`
  
  return formattedAddress
}

/**
 * Convert text to sentence case (first letter capitalized, rest lowercase, except for state abbreviations)
 */
function toSentenceCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Fetch random NPI records to get real addresses for KBA wrong options
 */
async function fetchRandomNPIAddresses(excludeNPI: string, count: number = 3): Promise<string[]> {
  const addresses: string[] = []
  
  // Common medical specialties to search for diverse addresses
  const specialties = ['Internal Medicine', 'Family Practice', 'Emergency Medicine', 'Pediatrics', 'Cardiology']
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']
  
  try {
    // Try to fetch records from different specialties and states
    for (let i = 0; i < count && addresses.length < count; i++) {
      const randomState = states[Math.floor(Math.random() * states.length)]
      const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)]
      
      const response = await fetch(
        `https://npiregistry.cms.hhs.gov/api/?taxonomy_description=${encodeURIComponent(randomSpecialty)}&state=${randomState}&limit=10&version=2.1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            // Get a random record from the results
            const randomRecord = data.results[Math.floor(Math.random() * data.results.length)]
            
            // Skip if it's the same NPI we're verifying
            if (randomRecord.number === excludeNPI) continue
            
            // Get practice address
            const practiceAddress = randomRecord.addresses?.find(
              (addr: any) => addr.address_purpose === 'LOCATION'
            ) || randomRecord.addresses?.[0]
            
            if (practiceAddress) {
              const formattedAddress = formatAddress(practiceAddress)
              
              // Avoid duplicates
              if (!addresses.includes(formattedAddress)) {
                addresses.push(formattedAddress)
              }
            }
          }
        }
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Error fetching random NPI addresses:', error)
  }
  
  // If we couldn't get enough real addresses, fall back to some realistic ones
  if (addresses.length < count) {
    const fallbackAddresses = [
      '1234 Medical Center Dr, New York, NY 10001',
      '567 Healthcare Blvd, Los Angeles, CA 90210',
      '890 Clinic Ave, Chicago, IL 60601',
      '2345 Hospital Way, Houston, TX 77001',
      '678 Wellness St, Phoenix, AZ 85001',
    ].map(addr => toSentenceCase(addr))
    
    fallbackAddresses.forEach(addr => {
      if (addresses.length < count && !addresses.includes(addr)) {
        addresses.push(addr)
      }
    })
  }
  
  return addresses.slice(0, count)
}

/**
 * Generate KBA (Knowledge-Based Authentication) questions from an NPI record
 * These are lightweight verification questions based on the NPI data
 */
export async function generateKBAQuestions(record: NPIRecord): Promise<KBAQuestion[]> {
  const questions: KBAQuestion[] = []
  
  // Question 1: Practice location (specific address)
  const practiceAddresses = record.addresses?.filter(
    addr => addr.address_purpose === 'LOCATION'
  ) || []
  
  if (practiceAddresses.length > 0) {
    const correctLocation = practiceAddresses[0]
    // Format address in consistent sentence case
    const correctAnswer = formatAddress(correctLocation)
    
    // Fetch real addresses from other NPI records
    const wrongOptions = await fetchRandomNPIAddresses(record.number, 3)
    
    questions.push({
      question: 'Which of these locations have you practiced at?',
      options: [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5),
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

