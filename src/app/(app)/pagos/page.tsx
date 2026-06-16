import { getSession } from '@/lib/auth'
import PagosClient from './PagosClient'

export const metadata = { title: 'Pagos' }

export default async function PagosPage() {
  const session = await getSession()
  if (!session) return null
  return <PagosClient session={session} />
}
