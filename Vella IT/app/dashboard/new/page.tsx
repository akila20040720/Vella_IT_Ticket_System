import { AppShell } from '@/components/app-shell'
import { TicketCreateForm } from '@/components/ticket-create-form'

export default function NewTicketPage() {
  return (
    <AppShell
      title="Create Ticket"
      description="Capture the issue, attach supporting files, and route the request into the VELLA IT SUPPORT queue."
    >
      <TicketCreateForm />
    </AppShell>
  )
}