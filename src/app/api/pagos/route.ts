import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    const url = new URL(request.url)
    const estatus = url.searchParams.get('estatus') || ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const per = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per') || '50', 10)))

    const where: Record<string, unknown> = { eliminadoEn: null }
    if (session.rol !== 'ADMIN') where.vendedorId = session.id
    if (estatus) where.estatus = estatus

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        include: {
          cliente: { select: { id: true, nombre: true } },
          vendedor: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaCreacion: 'desc' },
        skip: (page - 1) * per,
        take: per,
      }),
      prisma.pago.count({ where }),
    ])

    return NextResponse.json({ pagos, total, page, pages: Math.ceil(total / per) })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession()
    const { id, estatus } = await request.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const data: Record<string, unknown> = { estatus: estatus || 'pagado' }
    if ((estatus || 'pagado') === 'pagado') data.fechaPago = new Date()
    const pago = await prisma.pago.update({ where: { id }, data })
    return NextResponse.json({ pago })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
