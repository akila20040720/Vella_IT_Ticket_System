import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAdminEmail, resolveUserEmail } from '@/services/auth'

async function resolveEmailFromMicrosoftGraph(providerToken: string | undefined | null) {
  if (!providerToken) return null

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,displayName', {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    })

    if (!response.ok) return null

    const profile = (await response.json()) as {
      mail?: string | null
      userPrincipalName?: string | null
      displayName?: string | null
    }

    return profile.mail?.trim() || profile.userPrincipalName?.trim() || null
  } catch (err) {
    console.warn('Failed to resolve email from Microsoft Graph', err)
    return null
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const response = NextResponse.redirect(new URL('/', origin))

  if (!code) {
    return response
  }

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  const user = data.user
  const providerToken = data.session?.provider_token

    if (error) {
      console.error('Session Exchange Error (debug):', error)
      const desc = encodeURIComponent(error.message || JSON.stringify(error))
      return NextResponse.redirect(new URL(`/?error=session_exchange_failed&desc=${desc}`, origin))
    }

  const email = resolveUserEmail(user)

  const graphEmail = email ?? (await resolveEmailFromMicrosoftGraph(providerToken))

  if (!graphEmail) {
    console.warn('No email in user data after exchange (debug)', { data })
    const desc = encodeURIComponent(JSON.stringify({ user: data.user ?? null, hasProviderToken: Boolean(providerToken) }))
    return NextResponse.redirect(new URL(`/?error=no_email&desc=${desc}`, origin))
  }

  const destination = isAdminEmail(graphEmail) ? '/admin/dashboard' : '/dashboard'
  response.headers.set('Location', new URL(destination, origin).toString())
  return response
}