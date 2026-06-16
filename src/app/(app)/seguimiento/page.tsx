import { getSession } from '@/lib/auth'
import SeguimientoClient from './SeguimientoClient'

export const metadata = { title: 'Seguimiento' }

export default async function SeguimientoPage() {
  const session = await getSession()
  if (!session) return null
  return <SeguimientoClient session={session} />
}
