import { redirect } from 'next/navigation'

/**
 * Root page - Redirects to /claim
 */
export default function HomePage() {
  redirect('/claim')
}

