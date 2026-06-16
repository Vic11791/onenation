import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    await requireAdmin()
    const usuarios = await prisma.usuario.findMany({
      where: { eliminadoEn: null },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, metaMes: true, ligaAgenda: true, avatar: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json({ usuarios })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { nombre, email, password, rol, metaMes } = await request.json()
    if (!nombre || !email || !password)
      return NextResponse.json({ error: 'nombre, email y password requeridos' }, { status: 400 })

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 12)
    let liga = slugify(nombre)
    if (await prisma.usuario.findUnique({ where: { ligaAgenda: liga } }))
      liga = `${liga}-${Math.random().toString(36).slice(2, 6)}`

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol: rol === 'ADMIN' ? 'ADMIN' : 'VENDEDOR',
        metaMes: metaMes ? Number(metaMes) : 0,
        ligaAgenda: liga,
      },
      select: { id: true, nombre: true, email: true, rol: true, ligaAgenda: true },
    })
    return NextResponse.json({ usuario })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
