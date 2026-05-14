import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { TicketComment, TicketSummary } from '@/types/ticket'

export type TicketFeedbackRecord = {
  id: string
  ticket_id: string
  rating: number
  feedback_text: string
  submitted_at: string
}

export type TicketStore = {
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

export async function readTicketStore(): Promise<TicketStore> {
  if (!existsSync(DATA_FILE)) {
    return emptyStore()
  }

  const raw = await readFile(DATA_FILE, 'utf-8')
  return normalizeStore(JSON.parse(raw))
}

export async function writeTicketStore(store: TicketStore) {
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

export async function updateTicketStore<T>(mutate: (store: TicketStore) => Promise<T> | T): Promise<T> {
  return withStoreLock(async () => {
    const store = await readTicketStore()
    const result = await mutate(store)
    await writeTicketStore(store)
    return result
  })
}