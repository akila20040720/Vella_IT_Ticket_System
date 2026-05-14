import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardStats({
  total,
  open,
  closed,
  critical,
}: {
  total: number
  open: number
  closed: number
  critical: number
}) {
  const items = [
    { label: 'Total Tickets', value: total, tone: 'secondary' as const },
    { label: 'Open', value: open, tone: 'secondary' as const },
    { label: 'Closed', value: closed, tone: 'success' as const },
    { label: 'Critical', value: critical, tone: 'destructive' as const },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</CardTitle>
              <Badge variant={item.tone}>{item.label === 'Critical' ? 'Alert' : 'Live'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}