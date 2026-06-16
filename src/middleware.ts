import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from './lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/leads', '/agenda/', '/_next', '/favicon', '/manifest']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Root landing page and public routes
  if (pathname === '/' || PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check session
  const token = request.cookies.get('crm_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = await verifySessionToken(token)
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('crm_session')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.svg|.*\\.png|.*\\.ico).*)'],
}
