import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const recordatorios = await prisma.recordatorio.findMany({
      where: { clienteId: id, eliminadoEn: null },
      orderBy: { fecha: 'asc' },
    })
    return NextResponse.json({ recordatorios })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { titulo, fecha } = await request.json()
    if (!titulo || !fecha) return NextResponse.json({ error: 'titulo y fecha requeridos' }, { status: 400 })
    const recordatorio = await prisma.recordatorio.create({
      data: { clienteId: id, usuarioId: session.id, titulo, fecha: new Date(fecha) },
    })
    return NextResponse.json({ recordatorio })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
