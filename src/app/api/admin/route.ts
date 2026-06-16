import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const config = await prisma.configNegocio.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    })
    return NextResponse.json({ config })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const allowed = [
      'nombre', 'logo', 'colorMarca', 'moneda', 'simboloMoneda', 'husoHorario',
      'horarioInicio', 'horarioFin', 'duracionCita', 'metaMes', 'mensajeWhatsapp',
      'comisionGlobal', 'umbralEstancado', 'storageProvider', 'metodosPago', 'motivosPerdida',
    ]
    const data: Record<string, unknown> = {}
    for (const k of allowed) if (k in body) data[k] = body[k]
    for (const n of ['horarioInicio', 'horarioFin', 'duracionCita', 'metaMes', 'comisionGlobal', 'umbralEstancado'])
      if (n in data) data[n] = Number(data[n])

    const config = await prisma.configNegocio.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    })
    return NextResponse.json({ config })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }
}
