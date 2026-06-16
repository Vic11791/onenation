import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireSession()
    const plantillas = await prisma.plantilla.findMany({
      where: { OR: [{ esGlobal: true }, { usuarioId: session.id }] },
      orderBy: [{ esFavorita: 'desc' }, { nombre: 'asc' }],
    })
    return NextResponse.json({ plantillas })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const { nombre, contenido, tipo, etapa, objecion, esFavorita } = await request.json()
    if (!nombre || !contenido)
      return NextResponse.json({ error: 'nombre y contenido requeridos' }, { status: 400 })
    const plantilla = await prisma.plantilla.create({
      data: {
        usuarioId: session.id,
        nombre,
        contenido,
        tipo: tipo || 'whatsapp',
        etapa: etapa || null,
        objecion: objecion || null,
        esFavorita: !!esFavorita,
        esGlobal: false,
      },
    })
    return NextResponse.json({ plantilla })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
