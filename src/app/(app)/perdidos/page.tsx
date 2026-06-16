import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PerdidosClient from './PerdidosClient'

export const metadata = { title: 'Perdidos' }

export default async function PerdidosPage() {
  const session = await getSession()
  if (!session) return null

  const where: any = { estado: 'PERDIDO', eliminadoEn: null }
  if (session.rol === 'VENDEDOR') where.vendedorId = session.id

  const clientes = await prisma.cliente.findMany({
    where,
    include: { vendedor: true },
    orderBy: { fechaPerdido: 'desc' },
  })

  return <PerdidosClient clientes={clientes} />
}
