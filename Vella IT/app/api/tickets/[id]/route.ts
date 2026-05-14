import { NextRequest, NextResponse } from 'next/server'
import { ticketUpdateSchema, formatZodError } from '@/lib/validators'
import { getCurrentProfile } from '@/services/auth'
import { getTicketById, updateTicketRecord } from '@/services/tickets'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ticket = await getTicketById(id, profile.id, profile.role === 'admin')

  if (!ticket.ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = ticketUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
  }

  try {
    const ticket = await updateTicketRecord({
      ticketId: id,
      input: parsed.data,
      actorEmail: profile.email,
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update ticket'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}