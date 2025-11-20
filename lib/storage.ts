import { Account } from '@/types'

// In-memory storage for serverless deployment (Vercel-compatible)
// Note: Data resets on each deployment, but works for POC demo
let accounts: Account[] = []

// Read all accounts from storage
export function getAccounts(): Account[] {
  return accounts
}

// Save a new account
export function saveAccount(account: Account): void {
  accounts.push(account)
}

// Check if email already exists
export function emailExists(email: string): boolean {
  return accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())
}

// Get account by email
export function getAccountByEmail(email: string): Account | null {
  return accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase()) || null
}
