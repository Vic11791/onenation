import { getSession } from '@/lib/auth'
import EmbudoClient from './EmbudoClient'

export const metadata = { title: 'Embudo' }

export default async function EmbudoPage() {
  const session = await getSession()
  if (!session) return null
  return <EmbudoClient session={session} />
}
