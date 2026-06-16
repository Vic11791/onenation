import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const citas = await prisma.cita.findMany({
      where: { clienteId: id, eliminadoEn: null },
      orderBy: { inicio: 'desc' },
    })
    return NextResponse.json({ citas })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { titulo, inicio, fin, notas, vendedorId } = await request.json()
    if (!titulo || !inicio || !fin)
      return NextResponse.json({ error: 'titulo, inicio y fin requeridos' }, { status: 400 })

    const cita = await prisma.cita.create({
      data: {
        clienteId: id,
        vendedorId: vendedorId || session.id,
        titulo,
        inicio: new Date(inicio),
        fin: new Date(fin),
        notas: notas || null,
        estado: 'pendiente',
      },
    })
    await prisma.interaccion.create({
      data: { clienteId: id, usuarioId: session.id, tipo: 'Sistema', descripcion: `Cita agendada: ${titulo}` },
    })
    return NextResponse.json({ cita })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
