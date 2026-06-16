import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const pagos = await prisma.pago.findMany({
      where: { clienteId: id, eliminadoEn: null },
      orderBy: { fechaCreacion: 'desc' },
    })
    return NextResponse.json({ pagos })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const body = await request.json()
    const { monto, metodo, concepto, fechaVencimiento, estatus, moneda } = body
    if (monto == null) return NextResponse.json({ error: 'monto requerido' }, { status: 400 })

    const cliente = await prisma.cliente.findUnique({ where: { id }, select: { vendedorId: true } })

    const contador = await prisma.contadorFolio.upsert({
      where: { id: 'singleton' },
      update: { ultimo: { increment: 1 } },
      create: { id: 'singleton', ultimo: 1 },
    })
    const folio = `F-${String(contador.ultimo).padStart(5, '0')}`

    const pago = await prisma.pago.create({
      data: {
        clienteId: id,
        vendedorId: cliente?.vendedorId || session.id,
        monto: Number(monto),
        metodo: metodo || 'Transferencia',
        concepto: concepto || null,
        estatus: estatus || 'pendiente',
        moneda: moneda || 'USD',
        folio,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
      },
    })
    return NextResponse.json({ pago })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
