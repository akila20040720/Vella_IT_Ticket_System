'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function TicketFeedbackPanel({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState('5')
  const [feedbackText, setFeedbackText] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const response = await fetch(`/api/tickets/${ticketId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedbackText }),
      })

      const payload = await response.json()
      if (!response.ok) {
        toast.error(payload.error ?? 'Unable to submit feedback')
        return
      }

      toast.success('Feedback submitted')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>Share closure feedback once the issue is resolved.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(event.target.value)} />
          <Textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Optional feedback" />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}