import { getSession } from '@/lib/auth'
import ComparteClient from './ComparteClient'

export const metadata = { title: 'Comparte' }

export default async function CompartePage() {
  const session = await getSession()
  if (!session) return null
  return <ComparteClient session={session} />
}
