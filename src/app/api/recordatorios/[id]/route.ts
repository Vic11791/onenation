import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const body = await request.json()
    const data: Record<string, unknown> = {}
    if ('completado' in body) data.completado = !!body.completado
    if ('pospuesto' in body) data.pospuesto = !!body.pospuesto
    if (body.fecha) data.fecha = new Date(body.fecha)

    const existing = await prisma.recordatorio.findUnique({ where: { id } })
    if (!existing || existing.usuarioId !== session.id)
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const recordatorio = await prisma.recordatorio.update({ where: { id }, data })
    return NextResponse.json({ recordatorio })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
