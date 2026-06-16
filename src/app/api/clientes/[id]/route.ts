import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

async function loadOwned(id: string, session: { id: string; rol: string }) {
  const cliente = await prisma.cliente.findFirst({ where: { id, eliminadoEn: null } })
  if (!cliente) return { error: 'No encontrado', status: 404 as const }
  if (session.rol !== 'ADMIN' && cliente.vendedorId !== session.id)
    return { error: 'No autorizado', status: 403 as const }
  return { cliente }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const owned = await loadOwned(id, session)
    if ('error' in owned) return NextResponse.json({ error: owned.error }, { status: owned.status })

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        vendedor: { select: { id: true, nombre: true, email: true } },
        empresa: true,
        citas: { where: { eliminadoEn: null }, orderBy: { inicio: 'desc' } },
        pagos: { where: { eliminadoEn: null }, orderBy: { fechaCreacion: 'desc' } },
        notas_: { where: { eliminadoEn: null }, orderBy: { fecha: 'desc' } },
        interacciones: { orderBy: { fecha: 'desc' }, take: 50 },
        archivos: { where: { eliminadoEn: null }, orderBy: { fechaCreacion: 'desc' }, select: { id: true, nombre: true, etiqueta: true, tipo: true, tamano: true, url: true, fechaCreacion: true } },
        recordatorios: { where: { eliminadoEn: null }, orderBy: { fecha: 'asc' } },
        etiquetas: { include: { etiqueta: true } },
        favoritos: { where: { usuarioId: session.id } },
      },
    })

    return NextResponse.json({ cliente })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const owned = await loadOwned(id, session)
    if ('error' in owned) return NextResponse.json({ error: owned.error }, { status: owned.status })
    const prev = owned.cliente
    const body = await request.json()

    const allowed = [
      'nombre', 'telefono', 'telefonoIntl', 'email', 'origen', 'etapa', 'estado',
      'temperatura', 'objecion', 'notas', 'proximaAccion', 'proximaAccionFecha',
      'valorEstimado', 'vendedorId', 'empresaId', 'puestoEmpresa', 'ultimoContacto',
    ]
    const data: Record<string, unknown> = {}
    for (const k of allowed) if (k in body) data[k] = body[k]
    if ('proximaAccionFecha' in data && data.proximaAccionFecha)
      data.proximaAccionFecha = new Date(data.proximaAccionFecha as string)

    const cliente = await prisma.cliente.update({ where: { id }, data })

    if (data.etapa && data.etapa !== prev.etapa) {
      await prisma.interaccion.create({
        data: { clienteId: id, usuarioId: session.id, tipo: 'Sistema', descripcion: `Etapa: ${prev.etapa} → ${data.etapa}` },
      })
    }
    if (data.estado && data.estado !== prev.estado) {
      await prisma.interaccion.create({
        data: { clienteId: id, usuarioId: session.id, tipo: 'Sistema', descripcion: `Estado: ${prev.estado} → ${data.estado}` },
      })
    }

    return NextResponse.json({ cliente })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const owned = await loadOwned(id, session)
    if ('error' in owned) return NextResponse.json({ error: owned.error }, { status: owned.status })
    await prisma.cliente.update({ where: { id }, data: { eliminadoEn: new Date() } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
