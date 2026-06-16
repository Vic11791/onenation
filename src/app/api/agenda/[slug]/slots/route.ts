import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const fecha = new URL(request.url).searchParams.get('fecha')
    if (!fecha) return NextResponse.json({ error: 'fecha requerida (YYYY-MM-DD)' }, { status: 400 })

    const vendedor = await prisma.usuario.findUnique({ where: { ligaAgenda: slug } })
    if (!vendedor) return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })

    const config = await prisma.configNegocio.findUnique({ where: { id: 'singleton' } })
    const horarioInicio = config?.horarioInicio ?? 10
    const horarioFin = config?.horarioFin ?? 18
    const duracion = config?.duracionCita ?? 60

    const [y, m, d] = fecha.split('-').map(Number)
    const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0)
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999)

    const citas = await prisma.cita.findMany({
      where: { vendedorId: vendedor.id, eliminadoEn: null, inicio: { gte: dayStart, lte: dayEnd } },
      select: { inicio: true, fin: true },
    })

    const now = new Date()
    const slots: { inicio: string; fin: string; disponible: boolean }[] = []
    for (let mins = horarioInicio * 60; mins + duracion <= horarioFin * 60; mins += duracion) {
      const start = new Date(y, m - 1, d, 0, mins, 0, 0)
      const end = new Date(start.getTime() + duracion * 60000)
      const taken = citas.some((c) => start < new Date(c.fin) && end > new Date(c.inicio))
      const past = start < now
      slots.push({ inicio: start.toISOString(), fin: end.toISOString(), disponible: !taken && !past })
    }

    return NextResponse.json({ slots, vendedor: { nombre: vendedor.nombre } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
