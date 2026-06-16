import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { estado, motivo } = await request.json()
    if (!['GANADO', 'PERDIDO', 'ARCHIVADO', 'ACTIVO'].includes(estado))
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })

    const prev = await prisma.cliente.findFirst({ where: { id, eliminadoEn: null } })
    if (!prev) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const now = new Date()
    const data: Record<string, unknown> = { estado }
    if (estado === 'GANADO') data.fechaGanado = now
    if (estado === 'PERDIDO') { data.fechaPerdido = now; data.motivoPerdida = motivo || null }
    if (estado === 'ARCHIVADO') {
      data.fechaArchivado = now
      data.estadoPrevioArchivado = prev.estado
      data.etapaPreviaArchivado = prev.etapa
    }
    if (estado === 'ACTIVO') { data.fechaArchivado = null; data.fechaPerdido = null }

    const cliente = await prisma.cliente.update({ where: { id }, data })

    await prisma.interaccion.create({
      data: {
        clienteId: id,
        usuarioId: session.id,
        tipo: 'Sistema',
        descripcion: `Marcado como ${estado}${motivo ? ` — ${motivo}` : ''}`,
      },
    })

    return NextResponse.json({ cliente })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
