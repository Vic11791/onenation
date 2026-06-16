import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, telefono, email, mensaje } = body

    if (!nombre || !telefono) {
      return NextResponse.json({ ok: false, error: 'Nombre y teléfono son requeridos' }, { status: 400 })
    }

    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source') || undefined
    const origen = utmSource ? `Landing (${utmSource})` : 'Landing'

    // Backup anti-loss record
    const lead = await prisma.leadPendiente.create({
      data: { nombre, telefono, email: email || null, origen, utmSource: utmSource || null },
    })

    // Check for existing client by phone
    const telefonoIntl = telefono.replace(/\D/g, '').length === 10
      ? '1' + telefono.replace(/\D/g, '')
      : telefono.replace(/\D/g, '')

    let cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { telefono: { equals: telefono } },
          { telefonoIntl: { equals: telefonoIntl } },
          ...(email ? [{ email: { equals: email } }] : []),
        ],
        eliminadoEn: null,
      },
    })

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre,
          telefono,
          telefonoIntl,
          email: email || null,
          origen,
          utmSource: utmSource || null,
          etapa: 'Nuevo',
          estado: 'ACTIVO',
          temperatura: 'TIBIO',
          proximaAccion: 'Contactar en menos de 24 horas',
          proximaAccionFecha: tomorrow,
          notas: mensaje || null,
        },
      })

      await prisma.interaccion.create({
        data: {
          clienteId: cliente.id,
          tipo: 'nota',
          descripcion: `Lead captado desde ${origen}${mensaje ? `. Mensaje: "${mensaje}"` : ''}`,
        },
      })
    }

    // Mark backup as processed
    await prisma.leadPendiente.update({
      where: { id: lead.id },
      data: { procesado: true },
    })

    return NextResponse.json({ ok: true, clienteId: cliente.id })
  } catch (error) {
    console.error('Landing lead error:', error)
    return NextResponse.json({ ok: false, error: 'Error guardando tu información. Por favor intenta de nuevo.' }, { status: 500 })
  }
}
