import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireSession()
    const recordatorios = await prisma.recordatorio.findMany({
      where: { usuarioId: session.id, completado: false, eliminadoEn: null },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { fecha: 'asc' },
    })
    return NextResponse.json({ recordatorios })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const { titulo, fecha, clienteId } = await request.json()
    if (!titulo || !fecha) return NextResponse.json({ error: 'titulo y fecha requeridos' }, { status: 400 })
    const recordatorio = await prisma.recordatorio.create({
      data: { usuarioId: session.id, titulo, fecha: new Date(fecha), clienteId: clienteId || null },
    })
    return NextResponse.json({ recordatorio })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
