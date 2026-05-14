import { NextRequest, NextResponse } from 'next/server'
import { ticketCreateSchema, formatZodError } from '@/lib/validators'
import { getCurrentProfile } from '@/services/auth'
import { createTicketRecord, listTicketsForUser } from '@/services/tickets'

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const { tickets, count, error } = await listTicketsForUser(profile.id, profile.role === 'admin', {
    query: url.searchParams.get('query') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    severity: url.searchParams.get('severity') ?? undefined,
    property: url.searchParams.get('property') ?? undefined,
    system: url.searchParams.get('system') ?? undefined,
    priority: url.searchParams.get('priority') ?? undefined,
    page: Number(url.searchParams.get('page') ?? '1'),
    pageSize: Number(url.searchParams.get('pageSize') ?? '10'),
  })

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ tickets, count })
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const payload = Object.fromEntries(
    [...formData.entries()].filter(([key]) => key !== 'attachments'),
  )

  const parsed = ticketCreateSchema.safeParse(payload)
  if (!parsed.success) {
    const errorMsg = formatZodError(parsed.error)
    console.error('Ticket validation error:', errorMsg, 'payload:', payload)
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  try {
    const result = await createTicketRecord({
      userId: profile.id,
      userEmail: profile.email,
      input: parsed.data,
    })

    return NextResponse.json({ ticket: result.ticket }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create ticket'
    console.error('Ticket creation error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}