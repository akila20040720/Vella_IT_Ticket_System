import { z } from 'zod'
import { incidentTypeOptions, priorityOptions, propertyOptions, severityOptions, statusOptions, systemOptions } from '@/utils/ticket-options'

const ticketStatusSchema = z.enum(statusOptions)

export const ticketCreateSchema = z.object({
  dateReported: z.string().min(1),
  reportedBy: z.string().min(2),
  contact: z.string().min(2),
  property: z.enum(propertyOptions),
  location: z.string().min(2),
  incidentType: z.enum(incidentTypeOptions),
  systemName: z.enum(systemOptions),
  severity: z.enum(severityOptions),
  priority: z.enum(priorityOptions),
  completionTargetHours: z.coerce.number().int().positive().max(720),
  description: z.string().min(10),
})

export const ticketUpdateSchema = z.object({
  status: ticketStatusSchema,
  assignedTo: z.string().uuid().optional().nullable(),
  adminNote: z.string().max(2000).optional(),
})

export const commentSchema = z.object({
  comment: z.string().min(2).max(2000),
})

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  feedbackText: z.string().max(2000).optional().default(''),
})

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>
export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>

export function formatZodError(error: z.ZodError): string {
  const issues = error.issues
  if (issues.length === 0) return 'Validation error'
  if (issues.length === 1) {
    const issue = issues[0]
    return `${issue.path.join('.')}: ${issue.message}`
  }
  return issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
}