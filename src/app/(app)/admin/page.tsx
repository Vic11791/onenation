import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export const metadata = { title: 'Administración' }

export default async function AdminPage() {
  const session = await getSession()
  if (!session) return null
  if (session.rol !== 'ADMIN') redirect('/dashboard')

  const auditoria = await prisma.registroAuditoria.findMany({
    orderBy: { fecha: 'desc' },
    take: 100,
    include: { usuario: { select: { nombre: true } } },
  })

  return <AdminClient auditoria={auditoria} />
}
