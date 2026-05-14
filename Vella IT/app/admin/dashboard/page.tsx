import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { AdminTicketTable } from '@/components/admin-ticket-table'
import { DashboardStats } from '@/components/dashboard-stats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { requireAdminProfile } from '@/services/auth'
import { listTicketsForUser } from '@/services/tickets'
import { propertyOptions, priorityOptions, severityOptions, statusOptions, systemOptions } from '@/utils/ticket-options'

type SearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const profile = await requireAdminProfile()
  const params = await searchParams
  const filters = {
    query: firstValue(params.query),
    status: firstValue(params.status),
    severity: firstValue(params.severity),
    property: firstValue(params.property),
    system: firstValue(params.system),
    priority: firstValue(params.priority),
    sortBy: firstValue(params.sortBy) as 'created_at' | 'severity' | 'priority' | 'status' | undefined,
    sortDirection: firstValue(params.sortDirection) as 'asc' | 'desc' | undefined,
    page: Number(firstValue(params.page) ?? '1'),
    pageSize: 10,
  }

  const { tickets, count } = await listTicketsForUser(profile.id, true, filters)
  const total = count ?? tickets.length
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
  const open = tickets.filter((ticket) => ticket.status === 'Open').length
  const closed = tickets.filter((ticket) => ticket.status === 'Closed').length
  const critical = tickets.filter((ticket) => ticket.severity === 'Critical').length

  return (
    <AppShell
      title="IT Administration Console"
      description="Review queue health, assign tickets, manage priorities, and monitor recent activity across the business."
      action={<Button asChild><Link href="/dashboard/new">Create Ticket</Link></Button>}
    >
      <div className="space-y-6">
        <DashboardStats total={total} open={open} closed={closed} critical={critical} />
        <form method="get" className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2 xl:grid-cols-7">
          <Input name="query" defaultValue={filters.query} placeholder="Search tickets" />
          <Select name="status" defaultValue={filters.status ?? ''}>
            <option value="">All Statuses</option>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="severity" defaultValue={filters.severity ?? ''}>
            <option value="">All Severities</option>
            {severityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="property" defaultValue={filters.property ?? ''}>
            <option value="">All Properties</option>
            {propertyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="system" defaultValue={filters.system ?? ''}>
            <option value="">All Systems</option>
            {systemOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="priority" defaultValue={filters.priority ?? ''}>
            <option value="">All Priorities</option>
            {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="sortBy" defaultValue={filters.sortBy ?? 'created_at'}>
            <option value="created_at">Newest</option>
            <option value="severity">Severity</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </Select>
          <Select name="sortDirection" defaultValue={filters.sortDirection ?? 'desc'}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
          <div className="flex items-center gap-2 xl:col-span-7">
            <Button type="submit">Apply Filters</Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard">Reset</Link>
            </Button>
          </div>
        </form>
        <AdminTicketTable tickets={tickets} />
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>Showing {tickets.length} of {total} tickets.</p>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" disabled={filters.page <= 1}>
              <Link href={`/admin/dashboard?page=${Math.max(1, filters.page - 1)}`}>Previous</Link>
            </Button>
            <span>Page {filters.page} of {totalPages}</span>
            <Button asChild variant="outline" size="sm" disabled={filters.page >= totalPages}>
              <Link href={`/admin/dashboard?page=${Math.min(totalPages, filters.page + 1)}`}>Next</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}