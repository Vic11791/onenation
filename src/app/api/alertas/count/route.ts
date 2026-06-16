import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ count: 0 })

    const hoy = new Date()
    const baseWhere = session.rol === 'ADMIN' ? {} : { vendedorId: session.id }

    const [accionesVencidas, pagosVencidos, leadsNuevos] = await Promise.all([
      prisma.cliente.count({
        where: {
          ...baseWhere,
          estado: 'ACTIVO',
          eliminadoEn: null,
          proximaAccionFecha: { lt: startOfDay(hoy) },
        },
      }),
      prisma.pago.count({
        where: {
          ...(session.rol !== 'ADMIN' ? { vendedorId: session.id } : {}),
          estatus: { in: ['pendiente', 'vencido'] },
          fechaVencimiento: { lt: hoy },
          eliminadoEn: null,
        },
      }),
      prisma.cliente.count({
        where: {
          ...baseWhere,
          etapa: 'Nuevo',
          estado: 'ACTIVO',
          eliminadoEn: null,
          fechaCreacion: { lt: new Date(hoy.getTime() - 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    return NextResponse.json({ count: accionesVencidas + pagosVencidos + leadsNuevos })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
