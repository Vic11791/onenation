import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const notas = await prisma.nota.findMany({
      where: { clienteId: id, eliminadoEn: null },
      orderBy: { fecha: 'desc' },
    })
    return NextResponse.json({ notas })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { contenido } = await request.json()
    if (!contenido) return NextResponse.json({ error: 'contenido requerido' }, { status: 400 })
    const nota = await prisma.nota.create({
      data: { clienteId: id, usuarioId: session.id, contenido },
    })
    return NextResponse.json({ nota })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
