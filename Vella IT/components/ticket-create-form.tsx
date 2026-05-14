'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { incidentTypeOptions, priorityOptions, propertyOptions, severityOptions, systemOptions } from '@/utils/ticket-options'

export function TicketCreateForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const response = await fetch('/api/tickets', {
          method: 'POST',
          body: formData,
        })

        const payload = await response.json()
        if (!response.ok) {
          console.error('Ticket submission error:', response.status, payload)
          toast.error(payload.error ?? `Error: ${response.statusText}`)
          return
        }

        toast.success('Ticket created successfully')
        form.reset()
        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Network error: Unable to create ticket')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a ticket</CardTitle>
        <CardDescription>Submit a new IT issue with target resolution time.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input type="date" name="dateReported" defaultValue={new Date().toISOString().slice(0, 10)} required />
          <Input name="reportedBy" placeholder="Reported by" required />
          <Input name="contact" placeholder="Contact number or email" required />
          <Select name="property" defaultValue="Vella HQ" required>
            {propertyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </Select>
          <Input name="location" placeholder="Location" required />
          <Select name="incidentType" defaultValue="System Issue" required>
            {incidentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </Select>
          <Select name="systemName" defaultValue="Opera" required>
            {systemOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </Select>
          <Select name="severity" defaultValue="Medium" required>
            {severityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </Select>
          <Input name="completionTargetHours" type="number" min={1} max={720} defaultValue={24} required />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}