"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminTicketDetailModal } from '@/components/admin-ticket-detail-modal'
import type { TicketSummary } from '@/types/ticket'

export function AdminTicketTable({ tickets }: { tickets: TicketSummary[] }) {
  const router = useRouter()
  const [pendingTicketId, startTransition] = useTransition()
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  async function handleViewAsUser(userId: string, ticketId: string) {
    try {
      await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      router.push(`/dashboard/tickets/${ticketId}`)
    } catch (err) {
      // noop - keep original behaviour if impersonation fails
      router.push(`/dashboard/tickets/${ticketId}`)
    }
  }

  function handleCloseTicket(ticketId: string) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Closed' }),
        })

        const payload = await response.json()

        if (!response.ok) {
          toast.error(payload.error || 'Unable to close ticket')
          return
        }

        toast.success(`Ticket ${payload.ticket.ticket_number} closed`)
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to close ticket'
        toast.error(message)
      }
    })
  }

  return (
    <>
      <Card className="border-slate-200/80 dark:border-slate-800">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length ? tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                <TableCell>{ticket.reported_by}</TableCell>
                <TableCell>{ticket.property}</TableCell>
                <TableCell>
                  <Badge variant={ticket.severity === 'Critical' ? 'destructive' : ticket.severity === 'High' ? 'warning' : 'secondary'}>{ticket.severity}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={ticket.status === 'Closed' ? 'success' : 'secondary'}>{ticket.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewAsUser(ticket.created_by, ticket.id)}>
                    View as User
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCloseTicket(ticket.id)}
                    disabled={ticket.status === 'Closed' || pendingTicketId}
                  >
                    {ticket.status === 'Closed' ? 'Closed' : 'Close Ticket'}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                  No tickets found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AdminTicketDetailModal
      ticketId={selectedTicketId}
      onClose={() => setSelectedTicketId(null)}
    />
  </>
  )
}