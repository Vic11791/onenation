import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CompletadosClient from './CompletadosClient'

export const metadata = { title: 'Completados' }

export default async function CompletadosPage() {
  const session = await getSession()
  if (!session) return null

  const where: any = { estado: 'GANADO', eliminadoEn: null }
  if (session.rol === 'VENDEDOR') where.vendedorId = session.id

  const clientes = await prisma.cliente.findMany({
    where,
    include: { vendedor: true },
    orderBy: { fechaGanado: 'desc' },
  })

  const total = clientes.reduce((s, c) => s + (c.valorEstimado || 0), 0)
  const count = clientes.length

  return <CompletadosClient clientes={clientes} total={total} count={count} />
}
