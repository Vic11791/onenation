import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatWhatsApp } from '@/lib/utils'

type Params = { params: Promise<{ slug: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const { nombre, telefono, email, inicio, fin, notas } = await request.json()
    if (!nombre || !telefono || !inicio || !fin)
      return NextResponse.json({ error: 'nombre, telefono, inicio y fin requeridos' }, { status: 400 })

    const vendedor = await prisma.usuario.findUnique({ where: { ligaAgenda: slug } })
    if (!vendedor) return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })

    const telefonoIntl = formatWhatsApp(telefono)

    await prisma.leadPendiente.create({
      data: { nombre, telefono, email: email || null, origen: `Agenda (${vendedor.nombre})` },
    })

    let cliente = await prisma.cliente.findFirst({
      where: {
        eliminadoEn: null,
        OR: [{ telefono }, { telefonoIntl }, ...(email ? [{ email }] : [])],
      },
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre,
          telefono,
          telefonoIntl,
          email: email || null,
          origen: `Agenda (${vendedor.nombre})`,
          etapa: 'Contactado',
          estado: 'ACTIVO',
          temperatura: 'CALIENTE',
          vendedorId: vendedor.id,
        },
      })
    }

    const startDate = new Date(inicio)
    const endDate = new Date(fin)
    const conflict = await prisma.cita.findFirst({
      where: {
        vendedorId: vendedor.id,
        eliminadoEn: null,
        inicio: { lt: endDate },
        fin: { gt: startDate },
      },
    })
    if (conflict) return NextResponse.json({ error: 'Ese horario ya no está disponible' }, { status: 409 })

    const cita = await prisma.cita.create({
      data: {
        clienteId: cliente.id,
        vendedorId: vendedor.id,
        titulo: `Cita con ${nombre}`,
        inicio: startDate,
        fin: endDate,
        notas: notas || null,
        estado: 'pendiente',
      },
    })

    await prisma.interaccion.create({
      data: { clienteId: cliente.id, tipo: 'Sistema', descripcion: `Cita agendada desde liga pública` },
    })

    return NextResponse.json({ ok: true, citaId: cita.id, clienteId: cliente.id })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
