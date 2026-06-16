import { prisma } from './prisma'

export async function audit({
  usuarioId,
  accion,
  entidad,
  entidadId,
  descripcion,
  ip,
  meta,
}: {
  usuarioId?: string | null
  accion: string
  entidad: string
  entidadId?: string
  descripcion: string
  ip?: string
  meta?: Record<string, unknown>
}) {
  try {
    await prisma.registroAuditoria.create({
      data: {
        usuarioId: usuarioId ?? undefined,
        accion,
        entidad,
        entidadId,
        descripcion,
        ip,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    })
  } catch {
    // Never let audit failure break the app
  }
}
