import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ArchivadosClient from './ArchivadosClient'

export const metadata = { title: 'Archivados' }

export default async function ArchivadosPage() {
  const session = await getSession()
  if (!session) return null

  const where: any = { estado: 'ARCHIVADO', eliminadoEn: null }
  if (session.rol === 'VENDEDOR') where.vendedorId = session.id

  const clientes = await prisma.cliente.findMany({
    where,
    include: { vendedor: true },
    orderBy: { fechaArchivado: 'desc' },
  })

  return <ArchivadosClient clientes={clientes} />
}
