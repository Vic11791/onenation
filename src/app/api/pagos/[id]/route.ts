import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const body = await request.json()
    const data: Record<string, unknown> = {}
    for (const k of ['estatus', 'monto', 'metodo', 'concepto'] as const) {
      if (k in body) data[k] = k === 'monto' ? Number(body[k]) : body[k]
    }
    if ('fechaPago' in body) data.fechaPago = body.fechaPago ? new Date(body.fechaPago) : null
    if ('fechaVencimiento' in body) data.fechaVencimiento = body.fechaVencimiento ? new Date(body.fechaVencimiento) : null
    if (body.estatus === 'pagado' && !('fechaPago' in body)) data.fechaPago = new Date()

    const pago = await prisma.pago.update({ where: { id }, data })
    return NextResponse.json({ pago })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
