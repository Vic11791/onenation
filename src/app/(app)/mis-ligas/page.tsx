import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MisLigasClient from './MisLigasClient'

export const metadata = { title: 'Mis ligas' }

export default async function MisLigasPage() {
  const session = await getSession()
  if (!session) return null
  const usuario = await prisma.usuario.findUnique({
    where: { id: session.id },
    select: { ligaAgenda: true },
  })
  return <MisLigasClient liga={usuario?.ligaAgenda ?? null} session={session} />
}
