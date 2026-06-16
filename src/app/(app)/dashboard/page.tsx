import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'
import { startOfMonth, endOfMonth } from '@/lib/utils'

export const metadata = { title: 'Tablero' }

async function getDashboardData(session: { id: string; rol: string }) {
  const hoy = new Date()
  const inicioMes = startOfMonth(hoy)
  const finMes = endOfMonth(hoy)
  const inicioMesAnterior = startOfMonth(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1))
  const finMesAnterior = endOfMonth(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1))
  const isAdmin = session.rol === 'ADMIN'
  const vendedorFilter = isAdmin ? {} : { vendedorId: session.id }

  const [
    ganadosEstesMes, ganadosMesAnterior,
    ingresosMes, ingresosMesAnterior,
    nuevosLeads, nuevosLeadsMesAnterior,
    citasMes,
    pagosVencidos, pagosVencidosMonto,
    accionesVencidas,
    sinAccion,
    embudoActivos,
  ] = await Promise.all([
    prisma.cliente.count({ where: { ...vendedorFilter, estado: 'GANADO', fechaGanado: { gte: inicioMes, lte: finMes } } }),
    prisma.cliente.count({ where: { ...vendedorFilter, estado: 'GANADO', fechaGanado: { gte: inicioMesAnterior, lte: finMesAnterior } } }),
    prisma.pago.aggregate({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), estatus: 'pagado', fechaPago: { gte: inicioMes, lte: finMes }, eliminadoEn: null }, _sum: { monto: true } }),
    prisma.pago.aggregate({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), estatus: 'pagado', fechaPago: { gte: inicioMesAnterior, lte: finMesAnterior }, eliminadoEn: null }, _sum: { monto: true } }),
    prisma.cliente.count({ where: { ...vendedorFilter, eliminadoEn: null, fechaCreacion: { gte: inicioMes } } }),
    prisma.cliente.count({ where: { ...vendedorFilter, eliminadoEn: null, fechaCreacion: { gte: inicioMesAnterior, lte: finMesAnterior } } }),
    prisma.cita.count({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), eliminadoEn: null, inicio: { gte: inicioMes, lte: finMes } } }),
    prisma.pago.count({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), estatus: { in: ['pendiente', 'vencido'] }, fechaVencimiento: { lt: hoy }, eliminadoEn: null } }),
    prisma.pago.aggregate({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), estatus: { in: ['pendiente', 'vencido'] }, fechaVencimiento: { lt: hoy }, eliminadoEn: null }, _sum: { monto: true } }),
    prisma.cliente.count({ where: { ...vendedorFilter, estado: 'ACTIVO', eliminadoEn: null, proximaAccionFecha: { lt: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) } } }),
    prisma.cliente.count({ where: { ...vendedorFilter, estado: 'ACTIVO', eliminadoEn: null, proximaAccion: null } }),
    prisma.cliente.groupBy({ by: ['etapa'], where: { ...vendedorFilter, estado: 'ACTIVO', eliminadoEn: null }, _count: { id: true }, _sum: { valorEstimado: true } }),
  ])

  // Historical data: last 6 months
  const historico: { mes: string; ingresos: number; clientes: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const ini = startOfMonth(d)
    const fin = endOfMonth(d)
    const [ing, cli] = await Promise.all([
      prisma.pago.aggregate({ where: { ...(isAdmin ? {} : { vendedorId: session.id }), estatus: 'pagado', fechaPago: { gte: ini, lte: fin }, eliminadoEn: null }, _sum: { monto: true } }),
      prisma.cliente.count({ where: { ...vendedorFilter, estado: 'GANADO', fechaGanado: { gte: ini, lte: fin } } }),
    ])
    historico.push({
      mes: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
      ingresos: ing._sum.monto || 0,
      clientes: cli,
    })
  }

  // Origins breakdown
  const origenes = await prisma.cliente.groupBy({
    by: ['origen'],
    where: { ...vendedorFilter, eliminadoEn: null, fechaCreacion: { gte: inicioMes } },
    _count: { id: true },
  })

  const config = await prisma.configNegocio.findUnique({ where: { id: 'singleton' } })

  return {
    ganadosEstesMes, ganadosMesAnterior,
    ingresosMes: ingresosMes._sum.monto || 0,
    ingresosMesAnterior: ingresosMesAnterior._sum.monto || 0,
    nuevosLeads, nuevosLeadsMesAnterior,
    citasMes,
    pagosVencidos, pagosVencidosMonto: pagosVencidosMonto._sum.monto || 0,
    accionesVencidas, sinAccion,
    embudo: embudoActivos,
    historico,
    origenes: origenes.map(o => ({ origen: o.origen || 'Sin origen', count: o._count.id })),
    metaMes: config?.metaMes || 15,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null
  const data = await getDashboardData(session)
  return <DashboardClient data={data} session={session} />
}
