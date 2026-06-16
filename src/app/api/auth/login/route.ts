import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSessionToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 })
    }

    // Rate limit: max 5 failed attempts per email in last 15 mins
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)
    const recentFailed = await prisma.intentoLogin.count({
      where: { email: email.toLowerCase(), exitoso: false, fecha: { gte: fifteenMinsAgo } },
    })
    if (recentFailed >= 5) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Espera 15 minutos e intenta de nuevo.' },
        { status: 429 }
      )
    }

    // Find user (don't reveal if email exists)
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, nombre: true, email: true, rol: true, passwordHash: true, activo: true, avatar: true },
    })

    const validPassword = usuario
      ? await bcrypt.compare(password, usuario.passwordHash)
      : false

    if (!usuario || !validPassword) {
      await prisma.intentoLogin.create({
        data: { email: email.toLowerCase(), exitoso: false },
      })
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    if (!usuario.activo) {
      return NextResponse.json({ error: 'Esta cuenta está desactivada' }, { status: 401 })
    }

    // Create session token
    const token = await createSessionToken({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      avatar: usuario.avatar,
    })

    await prisma.intentoLogin.create({
      data: { email: email.toLowerCase(), exitoso: true },
    })

    const response = NextResponse.json({
      ok: true,
      user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    })

    response.cookies.set('crm_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
