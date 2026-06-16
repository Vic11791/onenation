import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from '@/lib/utils'

export async function GET() {
  try {
    await requireAdmin()
    const usuarios = await prisma.usuario.findMany({
      where: { eliminadoEn: null, activo: true },
      select: { id: true, nombre: true, email: true, rol: true, metaMes: true, avatar: true },
      orderBy: { nombre: 'asc' },
    })

    const ini = startOfMonth(new Date())
    const fin = endOfMonth(new Date())

    const stats = await Promise.all(
      usuarios.map(async (u) => {
        const [clientes, ganados, ingresos] = await Promise.all([
          prisma.cliente.count({ where: { vendedorId: u.id, estado: 'ACTIVO', eliminadoEn: null } }),
          prisma.cliente.count({ where: { vendedorId: u.id, estado: 'GANADO', fechaGanado: { gte: ini, lte: fin } } }),
          prisma.pago.aggregate({ where: { vendedorId: u.id, estatus: 'pagado', fechaPago: { gte: ini, lte: fin }, eliminadoEn: null }, _sum: { monto: true } }),
        ])
        return {
          ...u,
          clientesActivos: clientes,
          ganadosMes: ganados,
          ingresosMes: ingresos._sum.monto || 0,
          pctMeta: u.metaMes > 0 ? Math.round((ganados / u.metaMes) * 100) : 0,
        }
      })
    )

    stats.sort((a, b) => b.ingresosMes - a.ingresosMes)
    return NextResponse.json({ equipo: stats })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }
}
