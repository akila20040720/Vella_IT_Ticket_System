import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { DashboardStats } from '@/components/dashboard-stats'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireProfile } from '@/services/auth'
import { getDashboardMetrics } from '@/services/tickets'

export default async function UserDashboardPage() {
  const profile = await requireProfile()
  const metrics = await getDashboardMetrics(profile.id, profile.role === 'admin')

  return (
    <AppShell
      title="Employee Dashboard"
      description="Create tickets, track progress, review timelines, and follow up on resolved incidents."
      action={<Button asChild><Link href="/dashboard/new">Create Ticket</Link></Button>}
    >
      <div className="space-y-6">
        <DashboardStats total={metrics.total} open={metrics.open} closed={metrics.closed} critical={metrics.critical} />
        <Card>
          <CardHeader>
            <CardTitle>My recent activity</CardTitle>
            <CardDescription>Tracked from the latest ticket events in Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.recent.length ? metrics.recent.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div>
                  <p className="font-medium">{ticket.ticket_number}</p>
                  <p className="text-sm text-slate-500">Updated {new Date(ticket.updated_at).toLocaleString()}</p>
                </div>
                <Badge variant={ticket.status === 'Closed' ? 'success' : 'secondary'}>{ticket.status}</Badge>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
                No tickets yet. Use the create button to submit a new issue.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}