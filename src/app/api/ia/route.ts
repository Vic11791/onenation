import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `Eres un asistente de ventas para "ONE NATION TAX AND DOCUMENT SERVICES LLC", un CRM de servicios fiscales y documentales. Ayudas a los vendedores a redactar mensajes de WhatsApp, manejar objeciones, dar seguimiento a clientes y cerrar ventas. Responde en español, de forma breve, cálida y profesional. Cuando se trate de un mensaje para enviar al cliente, escríbelo listo para copiar y pegar.`

function localResponse(mensaje: string): string {
  const m = mensaje.toLowerCase()
  if (m.includes('precio') || m.includes('caro') || m.includes('costo'))
    return 'Entiendo que el precio es importante. Te sugiero enfocar el valor: "Comprendo tu punto. Lo que ofrecemos te ahorra tiempo y evita errores costosos con el SAT/IRS. ¿Te parece si te muestro exactamente qué incluye?"'
  if (m.includes('seguimiento') || m.includes('contactar') || m.includes('mensaje'))
    return 'Mensaje sugerido: "Hola, ¿cómo estás? Te escribo para dar seguimiento. ¿Tuviste oportunidad de revisar lo que platicamos? Quedo atento para resolver cualquier duda."'
  if (m.includes('objeci') || m.includes('no quiere') || m.includes('lo pensaré'))
    return 'Para esa objeción: reconoce, pregunta y reencuadra. "Claro, es una decisión importante. ¿Qué es lo que más te genera duda? Así te ayudo a verlo con claridad."'
  if (m.includes('cita') || m.includes('agendar') || m.includes('llamada'))
    return 'Para agendar: "Me encantaría platicarte los detalles en una llamada corta de 15 min. ¿Te viene bien mañana por la mañana o prefieres por la tarde?"'
  return 'Estoy aquí para ayudarte con tus ventas. Puedo redactar mensajes de WhatsApp, manejar objeciones, sugerir seguimientos o ayudarte a agendar. ¿Qué necesitas?'
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const { mensaje, clienteId, contexto } = await request.json()
    if (!mensaje) return NextResponse.json({ error: 'mensaje requerido' }, { status: 400 })

    let ctx = contexto || ''
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { nombre: true, etapa: true, temperatura: true, objecion: true, origen: true },
      })
      if (cliente) ctx += `\nCliente: ${cliente.nombre}, etapa ${cliente.etapa}, temperatura ${cliente.temperatura}${cliente.objecion ? `, objeción: ${cliente.objecion}` : ''}.`
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ respuesta: localResponse(mensaje), fuente: 'local' })

    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey })
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT + (ctx ? `\n\nContexto: ${ctx}` : ''),
        messages: [{ role: 'user', content: mensaje }],
      })
      const text = (resp.content.filter((b) => b.type === 'text') as { type: 'text'; text: string }[])
        .map((b) => b.text)
        .join('\n')
      return NextResponse.json({ respuesta: text || localResponse(mensaje), fuente: 'anthropic' })
    } catch {
      return NextResponse.json({ respuesta: localResponse(mensaje), fuente: 'local' })
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 })
  }
}
