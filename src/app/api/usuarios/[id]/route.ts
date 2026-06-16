import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession()
    const { id } = await params
    const isSelf = session.id === id
    const isAdmin = session.rol === 'ADMIN'
    if (!isSelf && !isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const body = await request.json()
    const data: Record<string, unknown> = {}
    for (const k of ['nombre', 'email', 'avatar', 'tema', 'vistaDensidad'] as const)
      if (k in body) data[k] = body[k]
    if ('metaMes' in body) data.metaMes = Number(body.metaMes)
    if ('comision' in body && isAdmin) data.comision = body.comision == null ? null : Number(body.comision)
    if ('activo' in body && isAdmin) data.activo = !!body.activo
    // Rol can only be changed by admin and never on self
    if ('rol' in body && isAdmin && !isSelf) data.rol = body.rol === 'ADMIN' ? 'ADMIN' : 'VENDEDOR'
    if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12)

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true, avatar: true, tema: true, vistaDensidad: true, metaMes: true, ligaAgenda: true },
    })
    return NextResponse.json({ usuario })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
