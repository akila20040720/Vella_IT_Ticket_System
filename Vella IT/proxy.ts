import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { resolveUserEmail } from '@/services/auth'

const adminRoutePrefix = '/admin'
const protectedPrefixes = ['/dashboard', '/admin']

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user
  const path = request.nextUrl.pathname

  const email = resolveUserEmail(user)

  if (path === '/' && email) {
    const destination = adminEmails().includes(email.toLowerCase()) ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix))
  if (!isProtected) {
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const isAdmin = email ? adminEmails().includes(email.toLowerCase()) : false

  if (path.startsWith(adminRoutePrefix) && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/dashboard') && isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}