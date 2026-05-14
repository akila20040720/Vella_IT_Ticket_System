"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TicketSummary } from '@/types/ticket'

export function AdminTicketTable({ tickets }: { tickets: TicketSummary[] }) {
  const router = useRouter()

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
  return (
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
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tickets/${ticket.id}`}>Open</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewAsUser(ticket.created_by, ticket.id)}>
                    View as User
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
  )
}