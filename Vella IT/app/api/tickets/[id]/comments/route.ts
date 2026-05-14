import { NextRequest, NextResponse } from 'next/server'
import { commentSchema } from '@/lib/validators'
import { getCurrentProfile } from '@/services/auth'
import { addTicketComment } from '@/services/tickets'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const comment = await addTicketComment({
      ticketId: id,
      userId: profile.id,
      userName: profile.name,
      userEmail: profile.email,
      comment: parsed.data.comment,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to add comment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}