import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireSession()
    const { id } = await params
    const archivos = await prisma.archivo.findMany({
      where: { clienteId: id, eliminadoEn: null },
      orderBy: { fechaCreacion: 'desc' },
      select: { id: true, nombre: true, etiqueta: true, tipo: true, tamano: true, url: true, fechaCreacion: true },
    })
    return NextResponse.json({ archivos })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { nombre, etiqueta, tipo, tamano, datos, provider, url } = await request.json()
    if (!nombre || !tipo) return NextResponse.json({ error: 'nombre y tipo requeridos' }, { status: 400 })

    const archivo = await prisma.archivo.create({
      data: {
        clienteId: id,
        usuarioId: session.id,
        nombre,
        etiqueta: etiqueta || 'Otro',
        tipo,
        tamano: tamano || 0,
        datos: datos || null,
        url: url || null,
        provider: provider || 'db',
      },
      select: { id: true, nombre: true, etiqueta: true, tipo: true, tamano: true, url: true, fechaCreacion: true },
    })
    return NextResponse.json({ archivo })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
