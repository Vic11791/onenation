import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbUrl = process.env.DATABASE_URL || `file:${path.resolve('./dev.db')}`
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  const count = await prisma.usuario.count()
  if (count > 0) {
    console.log('Base ya tiene datos, omitiendo seed.')
    return
  }

  console.log('Sembrando datos de ejemplo...')

  const adminHash = await bcrypt.hash('Admin1234!', 12)
  const vendedorHash = await bcrypt.hash('Vendedor1!', 12)

  const admin = await prisma.usuario.create({
    data: { nombre: 'Victor Herrera', email: 'admin@onenationtax.com', passwordHash: adminHash, rol: 'ADMIN', ligaAgenda: 'victor', metaMes: 15 },
  })

  const maria = await prisma.usuario.create({
    data: { nombre: 'María González', email: 'maria@onenationtax.com', passwordHash: vendedorHash, rol: 'VENDEDOR', ligaAgenda: 'maria', metaMes: 5 },
  })

  const carlos = await prisma.usuario.create({
    data: { nombre: 'Carlos Reyes', email: 'carlos@onenationtax.com', passwordHash: vendedorHash, rol: 'VENDEDOR', ligaAgenda: 'carlos', metaMes: 5 },
  })

  await prisma.configNegocio.create({ data: { id: 'singleton' } })
  await prisma.contadorFolio.create({ data: { id: 'singleton', ultimo: 11 } })

  const etVIP = await prisma.etiqueta.create({ data: { nombre: 'VIP', color: '#f59e0b' } })
  const etRef = await prisma.etiqueta.create({ data: { nombre: 'Referido', color: '#8b5cf6' } })
  const etAnticipo = await prisma.etiqueta.create({ data: { nombre: 'Pagó anticipo', color: '#10b981' } })
  const etLLC = await prisma.etiqueta.create({ data: { nombre: 'LLC', color: '#3b82f6' } })
  const etTaxes = await prisma.etiqueta.create({ data: { nombre: 'Taxes', color: '#e05a5a' } })
  const etPlan = await prisma.etiqueta.create({ data: { nombre: 'Plan de negocios', color: '#6366f1' } })

  const empresa1 = await prisma.empresa.create({
    data: { nombre: 'Restaurante El Buen Sabor LLC', giro: 'Restaurante / Alimentos', rfcId: 'RBS2019AZ', direccion: '2450 W Camelback Rd, Phoenix AZ 85015', tamano: '5-10 empleados' },
  })

  const hoy = new Date()
  const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
  const manana = new Date(hoy); manana.setDate(manana.getDate() + 1)
  const en3dias = new Date(hoy); en3dias.setDate(hoy.getDate() + 3)
  const hace3dias = new Date(hoy); hace3dias.setDate(hoy.getDate() - 3)
  const hace7dias = new Date(hoy); hace7dias.setDate(hoy.getDate() - 7)
  const hace15dias = new Date(hoy); hace15dias.setDate(hoy.getDate() - 15)

  // Cliente 1 - Nuevo, CALIENTE, acción VENCIDA
  const c1 = await prisma.cliente.create({
    data: {
      nombre: 'María Rodríguez', telefono: '6025551234', telefonoIntl: '16025551234',
      email: 'mrodriguez@email.com', origen: 'Instagram', etapa: 'Nuevo', estado: 'ACTIVO',
      temperatura: 'CALIENTE', objecion: 'Está caro',
      notas: 'Interesada en llenado de taxes. También preguntó por formación de LLC.',
      proximaAccion: 'Llamar para explicar precios y opciones de pago',
      proximaAccionFecha: ayer, valorEstimado: 350, vendedorId: maria.id, ultimoContacto: hace3dias,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c1.id, etiquetaId: etTaxes.id }] })
  await prisma.interaccion.create({ data: { clienteId: c1.id, usuarioId: maria.id, tipo: 'nota', descripcion: 'Contacto inicial por Instagram. Muy interesada pero dice que está caro.', fecha: hace3dias } })

  // Cliente 2 - Cita agendada, CALIENTE
  const c2 = await prisma.cliente.create({
    data: {
      nombre: 'Juan Carlos López', telefono: '6025552345', telefonoIntl: '16025552345',
      email: 'jlopez@email.com', origen: 'Landing', etapa: 'Cita agendada', estado: 'ACTIVO',
      temperatura: 'CALIENTE', objecion: 'Lo voy a pensar',
      notas: 'Quiere hacer su LLC y plan de negocios para restaurante. Tiene un socio.',
      proximaAccion: 'Confirmar asistencia a cita',
      proximaAccionFecha: manana, valorEstimado: 500, vendedorId: carlos.id, ultimoContacto: hoy,
      empresaId: empresa1.id, puestoEmpresa: 'Propietario',
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c2.id, etiquetaId: etLLC.id }, { clienteId: c2.id, etiquetaId: etVIP.id }] })
  await prisma.interaccion.create({ data: { clienteId: c2.id, usuarioId: carlos.id, tipo: 'cita', descripcion: 'Cita agendada para mañana a las 11:00am.', fecha: hoy } })

  // Cliente 3 - Contactado, TIBIO
  const c3 = await prisma.cliente.create({
    data: {
      nombre: 'Ana Patricia Méndez', telefono: '6025553456', telefonoIntl: '16025553456',
      email: 'amendez@email.com', origen: 'Facebook', etapa: 'Contactado', estado: 'ACTIVO',
      temperatura: 'TIBIO', objecion: 'Lo voy a pensar',
      notas: 'Contadora independiente. Quiere formalizar su negocio como LLC.',
      proximaAccion: 'Enviar propuesta por correo',
      proximaAccionFecha: en3dias, valorEstimado: 800, vendedorId: maria.id, ultimoContacto: hace7dias,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c3.id, etiquetaId: etLLC.id }, { clienteId: c3.id, etiquetaId: etRef.id }] })
  await prisma.interaccion.create({ data: { clienteId: c3.id, usuarioId: maria.id, tipo: 'whatsapp', descripcion: 'Enviamos información por WhatsApp. Dijo que lo piensa y responde esta semana.', fecha: hace7dias } })

  // Cliente 4 - Propuesta enviada, CALIENTE, acción VENCIDA HOY
  const c4 = await prisma.cliente.create({
    data: {
      nombre: 'Roberto Sánchez', telefono: '6025554567', telefonoIntl: '16025554567',
      email: 'rsanchez@email.com', origen: 'Recomendado', etapa: 'Propuesta enviada', estado: 'ACTIVO',
      temperatura: 'CALIENTE', objecion: 'Está caro',
      notas: 'Abogado que quiere declarar taxes. Listo para cerrar, solo negocia precio.',
      proximaAccion: 'Dar seguimiento a propuesta enviada — ¿tiene preguntas?',
      proximaAccionFecha: hoy, valorEstimado: 1200, vendedorId: admin.id, ultimoContacto: hace3dias,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c4.id, etiquetaId: etVIP.id }, { clienteId: c4.id, etiquetaId: etTaxes.id }] })
  await prisma.interaccion.create({ data: { clienteId: c4.id, usuarioId: admin.id, tipo: 'email', descripcion: 'Propuesta enviada por correo. Precio: $1,200 por taxes + consultoría.', fecha: hace3dias } })

  // Cliente 8 - Nuevo, FRIO, lead viejo sin contacto (>24h - alerta)
  const hace26h = new Date(hoy.getTime() - 26 * 60 * 60 * 1000)
  const c8 = await prisma.cliente.create({
    data: {
      nombre: 'Sofia Torres', telefono: '6025558901', telefonoIntl: '16025558901',
      email: 'storres@email.com', origen: 'Landing', utmSource: 'instagram',
      etapa: 'Nuevo', estado: 'ACTIVO', temperatura: 'FRIO',
      notas: 'Llenó el formulario de la landing. Sin contacto todavía.',
      proximaAccion: 'Llamar para presentarse',
      proximaAccionFecha: ayer, valorEstimado: 250, vendedorId: carlos.id,
      ultimoContacto: null, fechaCreacion: hace26h,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c8.id, etiquetaId: etTaxes.id }] })

  // Cliente 9 - Cita agendada, CALIENTE
  const c9 = await prisma.cliente.create({
    data: {
      nombre: 'David Martinez', telefono: '6025559012', telefonoIntl: '16025559012',
      email: 'dmartinez@email.com', origen: 'Agenda maria', etapa: 'Cita agendada', estado: 'ACTIVO',
      temperatura: 'CALIENTE', objecion: 'Está caro',
      notas: 'Pequeño negocio de jardinería. Quiere LLC + plan de negocios.',
      proximaAccion: 'Confirmar cita de pasado mañana',
      proximaAccionFecha: manana, valorEstimado: 600, vendedorId: carlos.id, ultimoContacto: hoy,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c9.id, etiquetaId: etLLC.id }, { clienteId: c9.id, etiquetaId: etPlan.id }] })

  // Cliente 10 - Propuesta enviada, TIBIO
  const c10 = await prisma.cliente.create({
    data: {
      nombre: 'Jennifer Kim', telefono: '6025550123', telefonoIntl: '16025550123',
      email: 'jkim@email.com', origen: 'Recomendado', etapa: 'Propuesta enviada', estado: 'ACTIVO',
      temperatura: 'TIBIO', objecion: 'Lo voy a pensar',
      notas: 'Dueña de salón de belleza. Interesada en formalizar LLC y hacer taxes.',
      proximaAccion: 'Seguimiento por WhatsApp',
      proximaAccionFecha: en3dias, valorEstimado: 900, vendedorId: maria.id, ultimoContacto: hace7dias,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c10.id, etiquetaId: etLLC.id }, { clienteId: c10.id, etiquetaId: etRef.id }] })

  // Cliente 11 - Nuevo sin próxima acción (alerta)
  const c11 = await prisma.cliente.create({
    data: {
      nombre: 'Michael Brown', telefono: '6025551111', telefonoIntl: '16025551111',
      email: 'mbrown@email.com', origen: 'Facebook', etapa: 'Nuevo', estado: 'ACTIVO',
      temperatura: 'TIBIO', notas: 'Preguntó por taxes. Sin acción definida aún.',
      proximaAccion: null, proximaAccionFecha: null,
      valorEstimado: 300, vendedorId: carlos.id, ultimoContacto: hace15dias,
    },
  })
  void c11

  // Ganados históricos para gráficas de 6 meses
  const historicos = [
    { mesesAtras: 5, valor: 1800, vendedorId: maria.id, origen: 'Instagram', metodo: 'Transferencia' },
    { mesesAtras: 4, valor: 2200, vendedorId: carlos.id, origen: 'Facebook', metodo: 'Tarjeta' },
    { mesesAtras: 3, valor: 1900, vendedorId: maria.id, origen: 'Recomendado', metodo: 'Efectivo' },
    { mesesAtras: 3, valor: 900, vendedorId: admin.id, origen: 'Landing', metodo: 'Tarjeta' },
    { mesesAtras: 2, valor: 2800, vendedorId: carlos.id, origen: 'Instagram', metodo: 'Liga de pago' },
    { mesesAtras: 2, valor: 1200, vendedorId: maria.id, origen: 'Recomendado', metodo: 'Transferencia' },
    { mesesAtras: 1, valor: 3100, vendedorId: admin.id, origen: 'Facebook', metodo: 'Tarjeta' },
    { mesesAtras: 1, valor: 800, vendedorId: carlos.id, origen: 'Landing', metodo: 'Efectivo' },
    { mesesAtras: 0, valor: 1500, vendedorId: maria.id, origen: 'Instagram', metodo: 'Transferencia' },
  ]

  for (let i = 0; i < historicos.length; i++) {
    const h = historicos[i]
    const fechaGanado = new Date()
    fechaGanado.setMonth(fechaGanado.getMonth() - h.mesesAtras)
    fechaGanado.setDate(Math.floor(Math.random() * 20) + 1)

    const hCliente = await prisma.cliente.create({
      data: {
        nombre: `Cliente Cerrado ${i + 1}`,
        telefono: `6025${55 + i}0000`,
        telefonoIntl: `16025${55 + i}0000`,
        origen: h.origen,
        etapa: 'Cliente ganado',
        estado: 'GANADO',
        temperatura: 'CALIENTE',
        valorEstimado: h.valor,
        fechaGanado,
        vendedorId: h.vendedorId,
        ultimoContacto: fechaGanado,
        fechaCreacion: new Date(fechaGanado.getTime() - 7 * 86400000),
        fechaActualizacion: fechaGanado,
      },
    })

    await prisma.pago.create({
      data: {
        clienteId: hCliente.id,
        vendedorId: h.vendedorId,
        monto: h.valor,
        metodo: h.metodo,
        estatus: 'pagado',
        concepto: 'Servicios profesionales',
        fechaPago: fechaGanado,
        folio: 100 + i,
      },
    })
  }

  // Ganado reciente (Linda Chen)
  const fechaGanadoMes = new Date(); fechaGanadoMes.setDate(5)
  const c5 = await prisma.cliente.create({
    data: {
      nombre: 'Linda Chen', telefono: '6025555678', telefonoIntl: '16025555678',
      email: 'lchen@email.com', origen: 'Instagram', etapa: 'Cliente ganado', estado: 'GANADO',
      temperatura: 'CALIENTE', valorEstimado: 450, fechaGanado: fechaGanadoMes,
      vendedorId: admin.id, ultimoContacto: fechaGanadoMes,
    },
  })
  await prisma.clienteEtiqueta.createMany({ data: [{ clienteId: c5.id, etiquetaId: etTaxes.id }, { clienteId: c5.id, etiquetaId: etAnticipo.id }] })
  await prisma.pago.create({
    data: { clienteId: c5.id, vendedorId: admin.id, monto: 450, metodo: 'Tarjeta', estatus: 'pagado', concepto: 'Llenado de taxes 2024', fechaPago: fechaGanadoMes, folio: 7 },
  })

  // Perdido (Marcus Johnson)
  const fechaPerdido = new Date(); fechaPerdido.setDate(fechaPerdido.getDate() - 10)
  const c6 = await prisma.cliente.create({
    data: {
      nombre: 'Marcus Johnson', telefono: '6025556789', telefonoIntl: '16025556789',
      email: 'mjohnson@email.com', origen: 'Facebook', etapa: 'Perdido', estado: 'PERDIDO',
      temperatura: 'FRIO', motivoPerdida: 'Precio', valorEstimado: 350, fechaPerdido, vendedorId: carlos.id,
    },
  })
  await prisma.interaccion.create({ data: { clienteId: c6.id, usuarioId: carlos.id, tipo: 'estado', descripcion: 'Marcado como Perdido. Motivo: Precio.', fecha: fechaPerdido } })

  // Archivado (Patricia Williams)
  const fechaArchivado = new Date(); fechaArchivado.setDate(fechaArchivado.getDate() - 5)
  const c7 = await prisma.cliente.create({
    data: {
      nombre: 'Patricia Williams', telefono: '6025557890', telefonoIntl: '16025557890',
      email: 'pwilliams@email.com', origen: 'Landing', etapa: 'Nuevo', estado: 'ARCHIVADO',
      temperatura: 'FRIO', valorEstimado: 0, fechaArchivado, estadoPrevioArchivado: 'ACTIVO',
      etapaPreviaArchivado: 'Nuevo', vendedorId: maria.id,
    },
  })
  void c7

  // Citas
  const citaFutura1 = new Date(); citaFutura1.setDate(citaFutura1.getDate() + 1); citaFutura1.setHours(11, 0, 0, 0)
  const citaFutura1Fin = new Date(citaFutura1); citaFutura1Fin.setHours(12, 0, 0, 0)
  await prisma.cita.create({ data: { clienteId: c2.id, vendedorId: carlos.id, titulo: 'Consulta LLC - Juan Carlos López', inicio: citaFutura1, fin: citaFutura1Fin, estado: 'confirmada' } })

  const citaFutura2 = new Date(); citaFutura2.setDate(citaFutura2.getDate() + 2); citaFutura2.setHours(14, 0, 0, 0)
  const citaFutura2Fin = new Date(citaFutura2); citaFutura2Fin.setHours(15, 0, 0, 0)
  await prisma.cita.create({ data: { clienteId: c9.id, vendedorId: carlos.id, titulo: 'Consulta Plan de Negocios - David Martinez', inicio: citaFutura2, fin: citaFutura2Fin, estado: 'pendiente' } })

  const citaPasada = new Date(); citaPasada.setDate(citaPasada.getDate() - 3); citaPasada.setHours(10, 0, 0, 0)
  const citaPasadaFin = new Date(citaPasada); citaPasadaFin.setHours(11, 0, 0, 0)
  await prisma.cita.create({ data: { clienteId: c4.id, vendedorId: admin.id, titulo: 'Revisión propuesta - Roberto Sánchez', inicio: citaPasada, fin: citaPasadaFin, estado: 'completada' } })

  // Pagos
  await prisma.pago.create({ data: { clienteId: c4.id, vendedorId: admin.id, monto: 600, metodo: 'Transferencia', estatus: 'vencido', concepto: 'Anticipo services taxes', fechaVencimiento: ayer, folio: 8 } })
  await prisma.pago.create({ data: { clienteId: c2.id, vendedorId: carlos.id, monto: 250, metodo: 'Efectivo', estatus: 'pagado', concepto: 'Anticipo 1/2 - Formación LLC', fechaPago: hace3dias, folio: 9 } })
  await prisma.pago.create({ data: { clienteId: c2.id, vendedorId: carlos.id, monto: 250, metodo: 'Tarjeta', estatus: 'pendiente', concepto: 'Saldo restante 2/2 - Formación LLC', fechaVencimiento: en3dias, folio: 10 } })
  await prisma.pago.create({ data: { clienteId: c3.id, vendedorId: maria.id, monto: 800, metodo: 'Liga de pago', estatus: 'pendiente', concepto: 'Formación LLC completa', fechaVencimiento: en3dias, folio: 11 } })

  // Plantillas
  const plantillasData = [
    { nombre: 'Seguimiento inicial', contenido: 'Hola {nombre}, gracias por tu interés en nuestros servicios 😊 Me gustaría contarte cómo podemos ayudarte. ¿Tienes 15 minutos esta semana para una llamada rápida?', tipo: 'whatsapp', etapa: 'Nuevo', esGlobal: true },
    { nombre: 'Vencer objeción precio', contenido: 'Hola {nombre}, entiendo tu preocupación con el precio. Lo que muchos clientes descubren es que nuestro servicio les ahorra mucho más en impuestos de lo que pagan. ¿Te gustaría que te muestre exactamente cuánto podrías ahorrar este año?', tipo: 'whatsapp', objecion: 'Está caro', esGlobal: true },
    { nombre: 'Vencer "lo voy a pensar"', contenido: 'Hola {nombre}, te entiendo perfectamente. ¿Qué es lo que más te preocupa? Con gusto te resuelvo cualquier duda para que puedas decidir con toda la información.', tipo: 'whatsapp', objecion: 'Lo voy a pensar', esGlobal: true },
    { nombre: 'Confirmar cita', contenido: 'Hola {nombre} 👋 Te confirmo tu cita de mañana con nosotros. ¿Tienes alguna pregunta antes de que nos veamos?', tipo: 'whatsapp', etapa: 'Cita agendada', esGlobal: true },
    { nombre: 'Recuperar pago vencido', contenido: 'Hola {nombre}, espero que todo esté bien. Tenemos un pago pendiente. ¿Hay alguna manera en que podamos facilitarte el proceso? Podemos aceptar tarjeta, transferencia o efectivo.', tipo: 'whatsapp', esGlobal: true },
    { nombre: 'Cerrar con urgencia', contenido: 'Hola {nombre}, quiero avisarte que tenemos pocos lugares disponibles este mes. ¿Podemos reservar tu lugar hoy para asegurar tu espacio?', tipo: 'whatsapp', etapa: 'Propuesta enviada', esGlobal: true },
    { nombre: 'Pedir el sí final', contenido: '¿Lo dejamos cerrado hoy, {nombre}? Todo está listo de nuestra parte. Solo necesito tu confirmación para arrancar con tu caso.', tipo: 'whatsapp', etapa: 'Propuesta enviada', esGlobal: true },
    { nombre: 'Post-venta / Bienvenida', contenido: '¡Bienvenido(a) a la familia ONE NATION, {nombre}! 🎉 Es un placer trabajar contigo. En los próximos días te estaré contactando para coordinar los detalles.', tipo: 'whatsapp', etapa: 'Cliente ganado', esGlobal: true },
    { nombre: 'Pedir referidos', contenido: 'Hola {nombre}, ¿conoces a alguien más que necesite ayuda con taxes o formación de LLC? Con gusto los atendemos y tú ganas un descuento especial en tu próxima consulta. 🙏', tipo: 'whatsapp', etapa: 'Cliente ganado', esGlobal: true },
    { nombre: 'Reactivar cliente frío', contenido: 'Hola {nombre}, hace tiempo que no hablamos. Hemos lanzado algunos nuevos servicios que creo podrían interesarte. ¿Tienes un momento para que te cuente?', tipo: 'whatsapp', esGlobal: true },
    { nombre: 'Bajar precio sin regalar', contenido: 'Hola {nombre}, entiendo que el presupuesto es importante. Podemos hacer un plan de pago: 50% hoy y 50% cuando terminemos. Así puedes arrancar sin afectar tu flujo. ¿Te funciona eso?', tipo: 'whatsapp', objecion: 'Está caro', esGlobal: true },
    { nombre: 'Seguimiento propuesta', contenido: 'Hola {nombre}, ¿tuviste oportunidad de revisar la propuesta que te enviamos? Estoy disponible para resolver cualquier duda. ¿Hacemos una llamada corta para repasarla juntos?', tipo: 'whatsapp', etapa: 'Propuesta enviada', esGlobal: true },
  ]

  for (const p of plantillasData) {
    await prisma.plantilla.create({ data: p })
  }

  console.log('✅ Datos sembrados correctamente.')
  console.log('📧 Admin: admin@onenationtax.com / Admin1234!')
  console.log('📧 María: maria@onenationtax.com / Vendedor1!')
  console.log('📧 Carlos: carlos@onenationtax.com / Vendedor1!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
