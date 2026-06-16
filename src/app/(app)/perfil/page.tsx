import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PerfilClient from './PerfilClient'

export const metadata = { title: 'Mi perfil' }

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) return null

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      nombre: true,
      email: true,
      avatar: true,
      tema: true,
      vistaDensidad: true,
      metaMes: true,
      ligaAgenda: true,
    },
  })

  if (!usuario) return null

  return <PerfilClient usuario={usuario} />
}
