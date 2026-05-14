"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TicketSummary, TicketComment } from '@/types/ticket'

interface AdminTicketDetailModalProps {
  ticketId: string | null
  onClose: () => void
}

export function AdminTicketDetailModal({ ticketId, onClose }: AdminTicketDetailModalProps) {
  const [ticket, setTicket] = useState<TicketSummary | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ticketId) return

    setLoading(true)
    fetch(`/api/tickets/${ticketId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ticket) {
          setTicket(data.ticket)
          setComments(data.comments || [])
        } else {
          toast.error(data.error || 'Unable to load ticket')
          onClose()
        }
      })
      .catch((err) => {
        toast.error('Unable to load ticket details')
        console.error(err)
        onClose()
      })
      .finally(() => setLoading(false))
  }, [ticketId, onClose])

  if (!ticketId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 dark:border-slate-800">
          <div>
            <CardTitle>{ticket?.ticket_number || 'Loading...'}</CardTitle>
            {ticket?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {ticket.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4 flex-shrink-0"
          >
            ✕
          </Button>
        </CardHeader>

        {loading ? (
          <CardContent className="py-8">
            <div className="text-center text-slate-500">Loading ticket details...</div>
          </CardContent>
        ) : ticket ? (
          <CardContent className="space-y-6 py-6">
            {/* Overview */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Overview</h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <Badge variant={ticket.status === 'Closed' ? 'success' : 'secondary'}>
                    {ticket.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Severity</p>
                  <Badge variant={ticket.severity === 'Critical' ? 'destructive' : ticket.severity === 'High' ? 'warning' : 'secondary'}>
                    {ticket.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Priority</p>
                  <p className="font-medium text-sm">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Target Hours</p>
                  <p className="font-medium text-sm">{ticket.completion_target_hours}h</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <h3 className="font-semibold text-sm mb-3">Details</h3>
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Reported By</p>
                  <p className="font-medium">{ticket.reported_by}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Property</p>
                  <p className="font-medium">{ticket.property}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="font-medium">{ticket.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">System</p>
                  <p className="font-medium">{ticket.system_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Incident Type</p>
                  <p className="font-medium">{ticket.incident_type}</p>
                </div>
                {ticket.assigned_to && (
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    <p className="font-medium">{ticket.assigned_to}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Date Reported</p>
                  <p className="font-medium">
                    {new Date(ticket.date_reported).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments */}
            {comments.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="font-semibold text-sm mb-3">Activity ({comments.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                    >
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {comment.user?.name ?? 'Team member'}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {comment.comment}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        ) : null}
      </Card>
    </div>
  )
}
