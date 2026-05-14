import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketCommentPanel } from '@/components/ticket-comment-panel'
import { TicketFeedbackPanel } from '@/components/ticket-feedback-panel'
import { requireProfile } from '@/services/auth'
import { getTicketById } from '@/services/tickets'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile()
  const { id } = await params
  const result = await getTicketById(id, profile.id, profile.role === 'admin')

  if (!result.ticket) {
    notFound()
  }

  const ticket = result.ticket

  return (
    <AppShell
      title={ticket.ticket_number}
      description={ticket.description}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div><p className="text-sm text-slate-500">Status</p><Badge variant={ticket.status === 'Closed' ? 'success' : 'secondary'}>{ticket.status}</Badge></div>
            <div><p className="text-sm text-slate-500">Severity</p><p className="font-medium">{ticket.severity}</p></div>
            <div><p className="text-sm text-slate-500">Priority</p><p className="font-medium">{ticket.priority}</p></div>
            <div><p className="text-sm text-slate-500">Target HRS</p><p className="font-medium">{ticket.completion_target_hours}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.comments.length ? result.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-medium">{comment.user?.name ?? 'Team member'}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{comment.comment}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )}
          </CardContent>
        </Card>

        <TicketCommentPanel ticketId={ticket.id} />

        {ticket.status === 'Closed' ? <TicketFeedbackPanel ticketId={ticket.id} /> : null}
      </div>
    </AppShell>
  )
}