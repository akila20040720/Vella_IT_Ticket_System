import { NextRequest, NextResponse } from 'next/server'
import { feedbackSchema } from '@/lib/validators'
import { getCurrentProfile } from '@/services/auth'
import { submitTicketFeedback } from '@/services/tickets'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const feedback = await submitTicketFeedback({
      ticketId: id,
      rating: parsed.data.rating,
      feedbackText: parsed.data.feedbackText,
    })

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit feedback'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}