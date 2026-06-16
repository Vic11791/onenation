import { getSession } from '@/lib/auth'
import AgendaClient from './AgendaClient'

export const metadata = { title: 'Agenda' }

export default async function AgendaPage() {
  const session = await getSession()
  if (!session) return null
  return <AgendaClient session={session} />
}
