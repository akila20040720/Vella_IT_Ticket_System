import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdminProfile } from '@/services/auth'

export async function POST(req: Request) {
  await requireAdminProfile()

  const body = await req.json().catch(() => ({}))
  const userId = body.userId as string | undefined

  if (!userId) {
    return NextResponse.json({ error: 'missing userId' }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    cookieStore.set({ name: 'impersonate_user', value: userId, path: '/' })
  } catch (err) {
    // ignore - best-effort in server components
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await requireAdminProfile()

  try {
    const cookieStore = await cookies()
    cookieStore.set({ name: 'impersonate_user', value: '', path: '/', maxAge: 0 })
  } catch (err) {
    // ignore
  }

  return NextResponse.json({ ok: true })
}

