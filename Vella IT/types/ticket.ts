export type TicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Waiting User' | 'Resolved' | 'Closed'
export type TicketSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
export type TicketPriority = 'L1' | 'L2' | 'L3'
export type Role = 'admin' | 'user'

export interface TicketSummary {
  id: string
  ticket_number: string
  reported_by: string
  contact: string | null
  property: string
  location: string
  incident_type: string
  system_name: string
  severity: TicketSeverity
  priority: TicketPriority
  completion_target_hours: number
  description: string
  status: TicketStatus
  assigned_to: string | null
  created_by: string
  date_reported: string
  created_at: string
  updated_at: string
  closed_at: string | null
}

export interface AppUserProfile {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface TicketAttachment {
  id: string
  ticket_id: string
  file_url: string
  file_name: string
  uploaded_at: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  comment: string
  created_at: string
  user?: {
    name: string
    email: string
  }
}