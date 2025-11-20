// NPI Registry API response types
export interface NPIRecord {
  number: string
  enumeration_type: string
  basic: {
    first_name: string
    last_name: string
    credential: string
    sole_proprietor: string
    gender: string
    enumeration_date: string
    last_updated: string
    status: string
    name: string
  }
  addresses: Array<{
    country_code: string
    country_name: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
    fax_number?: string
    address_type: string
    address_purpose: string
  }>
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
  }>
}

export interface NPIResponse {
  result_count: number
  results: NPIRecord[]
}

// Processed NPI match for display
export interface NPIMatch {
  npi: string
  name: string
  credential: string
  taxonomy: string
  practiceLocation: string
  fullRecord: NPIRecord
}

// Account data structure
export interface Account {
  email: string
  password?: string
  npi?: string
  verified: boolean
  name: string
  degree: string
  taxonomy: string
  practice_location: string
  created_at: string
}

// KBA Question structure
export interface KBAQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

