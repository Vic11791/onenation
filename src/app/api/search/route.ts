import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    const q = new URL(request.url).searchParams.get('q')?.trim() || ''
    if (!q) return NextResponse.json({ clientes: [] })

    const where: Record<string, unknown> = {
      eliminadoEn: null,
      OR: [
        { nombre: { contains: q } },
        { telefono: { contains: q } },
        { email: { contains: q } },
      ],
    }
    if (session.rol !== 'ADMIN') where.vendedorId = session.id

    const clientes = await prisma.cliente.findMany({
      where,
      select: { id: true, nombre: true, telefono: true, email: true, etapa: true, estado: true, temperatura: true },
      take: 10,
      orderBy: { fechaActualizacion: 'desc' },
    })
    return NextResponse.json({ clientes })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}
