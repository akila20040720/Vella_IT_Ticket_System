'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function TicketCommentPanel({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })

      const payload = await response.json()
      if (!response.ok) {
        toast.error(payload.error ?? 'Unable to post comment')
        return
      }

      toast.success('Comment added')
      setComment('')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <CardDescription>Keep the conversation attached to the ticket record.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" required />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !comment.trim()}>
              {pending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}