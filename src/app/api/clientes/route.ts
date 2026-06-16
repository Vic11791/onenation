import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatWhatsApp } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const etapa = url.searchParams.get('etapa') || ''
    const estado = url.searchParams.get('estado') || ''
    const temperatura = url.searchParams.get('temperatura') || ''
    const vendedorId = url.searchParams.get('vendedorId') || ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const per = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per') || '20', 10)))

    const where: Record<string, unknown> = { eliminadoEn: null }
    if (session.rol !== 'ADMIN') where.vendedorId = session.id
    else if (vendedorId) where.vendedorId = vendedorId
    if (etapa) where.etapa = etapa
    if (estado) where.estado = estado
    if (temperatura) where.temperatura = temperatura
    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { telefono: { contains: q } },
        { email: { contains: q } },
      ]
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: { vendedor: { select: { id: true, nombre: true } } },
        orderBy: { fechaActualizacion: 'desc' },
        skip: (page - 1) * per,
        take: per,
      }),
      prisma.cliente.count({ where }),
    ])

    return NextResponse.json({ clientes, total, page, pages: Math.ceil(total / per) })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { nombre, telefono, email, etapa, temperatura, origen, notas } = body
    if (!nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

    let vendedorId = session.id
    if (session.rol === 'ADMIN' && body.vendedorId) vendedorId = body.vendedorId

    const telefonoIntl = telefono ? formatWhatsApp(telefono) : null

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono: telefono || null,
        telefonoIntl,
        email: email || null,
        etapa: etapa || 'Nuevo',
        temperatura: temperatura || 'TIBIO',
        origen: origen || null,
        notas: notas || null,
        estado: 'ACTIVO',
        vendedorId,
      },
    })

    await prisma.interaccion.create({
      data: {
        clienteId: cliente.id,
        usuarioId: session.id,
        tipo: 'Sistema',
        descripcion: `Cliente creado por ${session.nombre}`,
      },
    })

    return NextResponse.json({ cliente })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
