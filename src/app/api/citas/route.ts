import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    const url = new URL(request.url)
    const desde = url.searchParams.get('desde')
    const hasta = url.searchParams.get('hasta')
    const vendedorId = url.searchParams.get('vendedorId')

    const where: Record<string, unknown> = { eliminadoEn: null }
    if (session.rol !== 'ADMIN') where.vendedorId = session.id
    else if (vendedorId) where.vendedorId = vendedorId
    if (desde || hasta) {
      where.inicio = {
        ...(desde ? { gte: new Date(desde) } : {}),
        ...(hasta ? { lte: new Date(hasta) } : {}),
      }
    }

    const citas = await prisma.cita.findMany({
      where,
      include: { cliente: { select: { id: true, nombre: true, telefono: true } } },
      orderBy: { inicio: 'asc' },
    })
    return NextResponse.json({ citas })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const { clienteId, titulo, inicio, fin, notas, vendedorId } = await request.json()
    if (!clienteId || !titulo || !inicio || !fin)
      return NextResponse.json({ error: 'clienteId, titulo, inicio y fin requeridos' }, { status: 400 })
    const cita = await prisma.cita.create({
      data: {
        clienteId,
        vendedorId: vendedorId || session.id,
        titulo,
        inicio: new Date(inicio),
        fin: new Date(fin),
        notas: notas || null,
        estado: 'pendiente',
      },
    })
    return NextResponse.json({ cita })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
