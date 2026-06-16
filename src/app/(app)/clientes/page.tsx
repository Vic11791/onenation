import { getSession } from '@/lib/auth'
import ClientesClient from './ClientesClient'

export const metadata = { title: 'Clientes' }

export default async function ClientesPage() {
  const session = await getSession()
  if (!session) return null
  return <ClientesClient session={session} />
}
