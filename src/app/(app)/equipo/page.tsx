import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EquipoClient from './EquipoClient'

export const metadata = { title: 'Equipo' }

export default async function EquipoPage() {
  const session = await getSession()
  if (!session) return null
  if (session.rol !== 'ADMIN') redirect('/dashboard')
  return <EquipoClient />
}
