import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionUser = {
  id: string
  nombre: string
  email: string
  rol: string
  avatar?: string | null
}

const getSecret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dev-secret-min-32-chars-change-in-production!!'
  )

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: payload.id as string,
      nombre: payload.nombre as string,
      email: payload.email as string,
      rol: payload.rol as string,
      avatar: payload.avatar as string | null | undefined,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('crm_session')?.value
    if (!token) return null
    return verifySessionToken(token)
  } catch {
    return null
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('No autorizado')
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.rol !== 'ADMIN') throw new Error('Solo administradores')
  return session
}
