import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']
const ADMIN_PATHS = ['/admin', '/api/admin']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    // Redirect logged-in users away from auth pages
    if (payload && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Protect all /admin routes
    if (pathname.startsWith('/admin')) {
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect /cart and /orders for logged-out users
    if (pathname.startsWith('/cart') || pathname.startsWith('/orders')) {
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}