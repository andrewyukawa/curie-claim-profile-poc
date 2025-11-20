import { NPIRecord, NPIResponse, NPIMatch } from '@/types'

/**
 * Fetch NPI records from the CMS NPI Registry API
 */
export async function fetchNPIByNumber(npi: string): Promise<NPIRecord[]> {
  try {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`NPI API request failed with status ${response.status}`)
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('NPI API returned non-JSON:', text.substring(0, 200))
      throw new Error('NPI API returned an invalid response')
    }
    
    const data: NPIResponse = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching NPI by number:', error)
    return []
  }
}

/**
 * Fetch NPI records by name and state
 */
export async function fetchNPIByName(
  firstName: string,
  lastName: string,
  state?: string
): Promise<NPIRecord[]> {
  try {
    let url = `https://npiregistry.cms.hhs.gov/api/?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&version=2.1`
    
    if (state) {
      url += `&state=${encodeURIComponent(state)}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`NPI API request failed with status ${response.status}`)
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('NPI API returned non-JSON:', text.substring(0, 200))
      throw new Error('NPI API returned an invalid response')
    }
    
    const data: NPIResponse = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching NPI by name:', error)
    return []
  }
}

/**
 * Transform NPI records into simplified match objects for display
 */
export function processNPIMatches(records: NPIRecord[]): NPIMatch[] {
  return records.map(record => {
    // Get primary taxonomy or first taxonomy
    const primaryTaxonomy = record.taxonomies?.find(t => t.primary) || record.taxonomies?.[0]
    const taxonomyDesc = primaryTaxonomy?.desc || 'Not specified'
    
    // Get practice location (first practice address)
    const practiceAddress = record.addresses?.find(
      addr => addr.address_purpose === 'LOCATION'
    ) || record.addresses?.[0]
    
    const practiceLocation = practiceAddress
      ? `${practiceAddress.city}, ${practiceAddress.state}`
      : 'Location not specified'
    
    return {
      npi: record.number,
      name: record.basic.name || `${record.basic.first_name} ${record.basic.last_name}`,
      credential: record.basic.credential || 'N/A',
      taxonomy: taxonomyDesc,
      practiceLocation,
      fullRecord: record,
    }
  })
}

