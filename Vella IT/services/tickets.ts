import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { TicketCreateInput, TicketUpdateInput } from '@/lib/validators'
import { sendTicketEmail } from '@/services/notifications'
import type { TicketAttachment, TicketComment, TicketSummary } from '@/types/ticket'

function uniqueRecipients(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim()))) ]
}

type TicketFeedbackRecord = {
  id: string
  ticket_id: string
  rating: number
  feedback_text: string
  submitted_at: string
}

type TicketStore = {
  tickets: TicketSummary[]
  comments: TicketComment[]
  feedback: TicketFeedbackRecord[]
}

const DATA_DIR = join(process.cwd(), 'data')
const DATA_FILE = join(DATA_DIR, 'tickets.json')

let storeQueue = Promise.resolve()

function emptyStore(): TicketStore {
  return {
    tickets: [],
    comments: [],
    feedback: [],
  }
}

function normalizeStore(value: unknown): TicketStore {
  if (!value || typeof value !== 'object') {
    return emptyStore()
  }

  const candidate = value as Partial<TicketStore>

  return {
    tickets: Array.isArray(candidate.tickets) ? candidate.tickets as TicketSummary[] : [],
    comments: Array.isArray(candidate.comments) ? candidate.comments as TicketComment[] : [],
    feedback: Array.isArray(candidate.feedback) ? candidate.feedback as TicketFeedbackRecord[] : [],
  }
}

async function readStore(): Promise<TicketStore> {
  if (!existsSync(DATA_FILE)) {
    return emptyStore()
  }

  const raw = await readFile(DATA_FILE, 'utf-8')
  return normalizeStore(JSON.parse(raw))
}

async function writeStore(store: TicketStore) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

async function withStoreLock<T>(operation: () => Promise<T>) {
  const previous = storeQueue
  let release!: () => void
  storeQueue = new Promise<void>((resolve) => {
    release = resolve
  })

  await previous

  try {
    return await operation()
  } finally {
    release()
  }
}

async function updateStore<T>(mutate: (store: TicketStore) => Promise<T> | T): Promise<T> {
  return withStoreLock(async () => {
    const store = await readStore()
    const result = await mutate(store)
    await writeStore(store)
    return result
  })
}

function createTicketNumber(tickets: TicketSummary[]) {
  const currentYear = new Date().getFullYear()
  const highestSequence = tickets.reduce((max, ticket) => {
    const match = ticket.ticket_number.match(/^TKT-(\d{4})-(\d{4})$/)
    if (!match || Number(match[1]) !== currentYear) {
      return max
    }

    return Math.max(max, Number(match[2]))
  }, 0)

  return `TKT-${currentYear}-${String(highestSequence + 1).padStart(4, '0')}`
}

function statusRank(status: TicketSummary['status']) {
  const order: Record<TicketSummary['status'], number> = {
    Open: 6,
    Assigned: 5,
    'In Progress': 4,
    'Waiting User': 3,
    Resolved: 2,
    Closed: 1,
  }

  return order[status]
}

function severityRank(severity: TicketSummary['severity']) {
  const order: Record<TicketSummary['severity'], number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  }

  return order[severity]
}

function priorityRank(priority: TicketSummary['priority']) {
  const order: Record<TicketSummary['priority'], number> = {
    L1: 3,
    L2: 2,
    L3: 1,
  }

  return order[priority]
}

function sortTickets(
  tickets: TicketSummary[],
  sortBy: NonNullable<TicketFilters['sortBy']>,
  sortDirection: NonNullable<TicketFilters['sortDirection']>,
) {
  const direction = sortDirection === 'asc' ? 1 : -1

  return [...tickets].sort((left, right) => {
    let comparison = 0

    switch (sortBy) {
      case 'severity':
        comparison = severityRank(left.severity) - severityRank(right.severity)
        break
      case 'priority':
        comparison = priorityRank(left.priority) - priorityRank(right.priority)
        break
      case 'status':
        comparison = statusRank(left.status) - statusRank(right.status)
        break
      case 'created_at':
      default:
        comparison = left.created_at.localeCompare(right.created_at)
        break
    }

    return comparison * direction
  })
}

export type TicketFilters = {
  query?: string
  status?: string
  severity?: string
  property?: string
  system?: string
  priority?: string
  sortBy?: 'created_at' | 'severity' | 'priority' | 'status'
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export async function listTicketsForUser(userId: string, isAdmin: boolean, filters: TicketFilters = {}) {
  try {
    const store = await readStore()
    const page = Math.max(filters.page ?? 1, 1)
    const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 50)

    const filteredTickets = store.tickets.filter((ticket) => {
      if (!isAdmin && ticket.created_by !== userId) {
        return false
      }

      if (filters.status && ticket.status !== filters.status) return false
      if (filters.severity && ticket.severity !== filters.severity) return false
      if (filters.property && ticket.property !== filters.property) return false
      if (filters.system && ticket.system_name !== filters.system) return false
      if (filters.priority && ticket.priority !== filters.priority) return false

      if (filters.query) {
        const query = filters.query.toLowerCase()
        return [ticket.ticket_number, ticket.reported_by, ticket.location, ticket.description]
          .some((value) => value.toLowerCase().includes(query))
      }

      return true
    })

    const sortedTickets = sortTickets(
      filteredTickets,
      filters.sortBy ?? 'created_at',
      filters.sortDirection ?? 'desc',
    )

    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      tickets: sortedTickets.slice(start, end),
      count: filteredTickets.length,
      error: null,
    }
  } catch (error) {
    return {
      tickets: [] as TicketSummary[],
      count: 0,
      error: error instanceof Error ? error.message : 'Unable to read ticket store',
    }
  }
}

export async function getTicketById(ticketId: string, userId: string, isAdmin: boolean) {
  try {
    const store = await readStore()
    const ticket = store.tickets.find((item) => item.id === ticketId && (isAdmin || item.created_by === userId)) ?? null

    return {
      ticket,
      comments: store.comments
        .filter((comment) => comment.ticket_id === ticketId)
        .sort((left, right) => left.created_at.localeCompare(right.created_at)),
      attachments: [] as TicketAttachment[],
      error: null,
    }
  } catch (error) {
    return {
      ticket: null,
      comments: [] as TicketComment[],
      attachments: [] as TicketAttachment[],
      error: error instanceof Error ? error.message : 'Unable to read ticket store',
    }
  }
}

export async function getDashboardMetrics(userId: string, isAdmin: boolean) {
  const { tickets } = await listTicketsForUser(userId, isAdmin, { page: 1, pageSize: 50 })

  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    closed: tickets.filter((ticket) => ticket.status === 'Closed').length,
    critical: tickets.filter((ticket) => ticket.severity === 'Critical').length,
    recent: tickets.slice(0, 5),
  }
}

export async function createTicketRecord(params: {
  userId: string
  userEmail: string
  input: TicketCreateInput
}) {
  const ticket = await updateStore(async (store) => {
    const now = new Date().toISOString()
    const newTicket: TicketSummary = {
      id: randomUUID(),
      ticket_number: createTicketNumber(store.tickets),
      reported_by: params.input.reportedBy,
      contact: params.input.contact,
      property: params.input.property,
      location: params.input.location,
      incident_type: params.input.incidentType,
      system_name: params.input.systemName,
      severity: params.input.severity,
      priority: params.input.priority,
      completion_target_hours: params.input.completionTargetHours,
      description: params.input.description,
      status: 'Open',
      assigned_to: null,
      created_by: params.userId,
      date_reported: params.input.dateReported,
      created_at: now,
      updated_at: now,
      closed_at: null,
    }

    store.tickets.push(newTicket)
    return newTicket
  })

  try {
    await sendTicketEmail({
      subject: `New ticket created: ${ticket.ticket_number}`,
      html: `<p>A new ticket was created by <strong>${params.input.reportedBy}</strong>.</p><p><strong>Ticket:</strong> ${ticket.ticket_number}</p><p><strong>Issue:</strong> ${ticket.description}</p>`,
      recipients: uniqueRecipients([params.userEmail, process.env.TEAM_IT_EMAIL, process.env.USER_EMAIL]),
    })
  } catch (error) {
    console.warn('Ticket email delivery failed:', error)
  }

  return { ticket }
}

export async function updateTicketRecord(params: {
  ticketId: string
  input: TicketUpdateInput
  actorEmail: string
}) {
  const updatedTicket = await updateStore(async (store) => {
    const index = store.tickets.findIndex((ticket) => ticket.id === params.ticketId)

    if (index === -1) {
      throw new Error('Ticket not found')
    }

    const currentTicket = store.tickets[index]
    const now = new Date().toISOString()
    const nextTicket: TicketSummary = {
      ...currentTicket,
      status: params.input.status,
      assigned_to: params.input.assignedTo ?? null,
      updated_at: now,
      closed_at: params.input.status === 'Closed' ? now : currentTicket.closed_at,
    }

    store.tickets[index] = nextTicket
    return nextTicket
  })

  try {
    await sendTicketEmail({
      subject: `Ticket updated: ${updatedTicket.ticket_number}`,
      html: `<p>Ticket <strong>${updatedTicket.ticket_number}</strong> changed to <strong>${updatedTicket.status}</strong>.</p>`,
      recipients: uniqueRecipients([process.env.TEAM_IT_EMAIL, params.actorEmail, process.env.USER_EMAIL]),
    })
  } catch (error) {
    console.warn('Ticket update email delivery failed:', error)
  }

  return updatedTicket
}

export async function addTicketComment(params: {
  ticketId: string
  userId: string
  userName: string
  userEmail: string
  comment: string
}) {
  return updateStore(async (store) => {
    const ticketExists = store.tickets.some((ticket) => ticket.id === params.ticketId)

    if (!ticketExists) {
      throw new Error('Ticket not found')
    }

    const comment: TicketComment = {
      id: randomUUID(),
      ticket_id: params.ticketId,
      user_id: params.userId,
      comment: params.comment,
      created_at: new Date().toISOString(),
      user: {
        name: params.userName,
        email: params.userEmail,
      },
    }

    store.comments.push(comment)
    return comment
  })
}

export async function submitTicketFeedback(params: {
  ticketId: string
  rating: number
  feedbackText: string
}) {
  return updateStore(async (store) => {
    const ticketExists = store.tickets.some((ticket) => ticket.id === params.ticketId)

    if (!ticketExists) {
      throw new Error('Ticket not found')
    }

    const feedback: TicketFeedbackRecord = {
      id: randomUUID(),
      ticket_id: params.ticketId,
      rating: params.rating,
      feedback_text: params.feedbackText,
      submitted_at: new Date().toISOString(),
    }

    store.feedback.push(feedback)
    return feedback
  })
}