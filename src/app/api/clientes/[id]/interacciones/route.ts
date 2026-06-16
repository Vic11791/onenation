import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const interacciones = await prisma.interaccion.findMany({
      where: { clienteId: id },
      orderBy: { fecha: 'desc' },
      take: 50,
    })
    return NextResponse.json({ interacciones })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { tipo, descripcion, fechaEditable, meta } = await request.json()
    if (!tipo || !descripcion)
      return NextResponse.json({ error: 'tipo y descripcion requeridos' }, { status: 400 })

    const interaccion = await prisma.interaccion.create({
      data: {
        clienteId: id,
        usuarioId: session.id,
        tipo,
        descripcion,
        fechaEditable: fechaEditable ? new Date(fechaEditable) : null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    })
    await prisma.cliente.update({ where: { id }, data: { ultimoContacto: new Date() } })
    return NextResponse.json({ interaccion })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
