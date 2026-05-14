import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/services/supabase/server'
import type { AppUserProfile, Role } from '@/types/ticket'

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return parseAdminEmails().includes(email.toLowerCase())
}

export function resolveUserEmail(user: {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
  identities?: Array<{ identity_data?: Record<string, unknown> | null }> | null
} | null | undefined): string | null {
  if (!user) return null

  const directEmail = user.email?.trim()
  if (directEmail) return directEmail

  const metadata = user.user_metadata ?? {}
  const identityData = user.identities?.[0]?.identity_data ?? {}

  const fallbackEmail =
    (metadata.email as string | undefined)?.trim() ||
    (metadata.preferred_username as string | undefined)?.trim() ||
    (metadata.upn as string | undefined)?.trim() ||
    (identityData.email as string | undefined)?.trim() ||
    (identityData.preferred_username as string | undefined)?.trim() ||
    (identityData.upn as string | undefined)?.trim() ||
    null

  return fallbackEmail || null
}

export async function getCurrentSessionUser() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function getCurrentProfile(): Promise<AppUserProfile | null> {
  const user = await getCurrentSessionUser()
  const email = resolveUserEmail(user)
  if (!email) return null
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  const role: Role = isAdminEmail(email) ? 'admin' : 'user'

  try {
    const nh = await import('next/headers')
    const cookieStore = await nh.cookies()
    const impersonateId = cookieStore.get('impersonate_user')?.value
    if (impersonateId && role === 'admin') {
      const { data: impersonated } = await supabase.from('users').select('*').eq('id', impersonateId).single()
      if (impersonated) return impersonated as AppUserProfile
    }
  } catch (_) {
    // ignore cookie/read errors and fall back to normal profile
  }

  const profile = {
    id: user.id,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? email,
    email,
    role,
    created_at: new Date().toISOString(),
  }

  await supabase.from('users').upsert(profile, { onConflict: 'id' })
  return profile
}

export async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect('/')
  }

  return profile
}

export async function requireAdminProfile() {
  const profile = await requireProfile()
  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return profile
}
