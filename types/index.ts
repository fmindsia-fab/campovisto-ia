// ─── Base ────────────────────────────────────────────────────────────────────

export type UUID = string
export type ISODateString = string

// ─── Roles ───────────────────────────────────────────────────────────────────

export type RoleName = 'admin' | 'field_operator' | 'drone_pilot' | 'human_reviewer' | 'client'

export interface Role {
  id: UUID
  name: RoleName
  description: string | null
}

export interface UserRole {
  user_id: UUID
  role_id: UUID
  roles?: Role
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface Profile {
  id: UUID
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  onboarding_step: number
  onboarding_completed_at: ISODateString | null
  created_at: ISODateString
  updated_at: ISODateString
}

// ─── Plans & Subscriptions ───────────────────────────────────────────────────

export type PlanName = 'free' | 'premium'

export interface Plan {
  id: UUID
  name: PlanName
  max_properties: number
  max_inspections_per_month: number
  max_images_per_inspection: number
  ai_analysis: boolean
  pdf_export: boolean
  kanban: boolean
  calendar: boolean
  notifications: boolean
  price_monthly: number
}

export interface Subscription {
  id: UUID
  user_id: UUID
  plan_id: UUID
  status: 'active' | 'inactive' | 'canceled' | 'past_due'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: ISODateString | null
  plans?: Plan
}

export interface UsageLimit {
  id: UUID
  user_id: UUID
  month: string
  properties_count: number
  inspections_count: number
}

// ─── Companies (futuro multiempresa) ─────────────────────────────────────────

export interface Company {
  id: UUID
  name: string
  created_at: ISODateString
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface Client {
  id: UUID
  name: string
  phone: string | null
  email: string | null
  city: string | null
  notes: string | null
  responsible_user_id: UUID | null
  created_by: UUID
  created_at: ISODateString
  updated_at: ISODateString
}

// ─── Properties ──────────────────────────────────────────────────────────────

export interface Property {
  id: UUID
  client_id: UUID
  name: string
  location: string | null
  activity_type: string | null
  notes: string | null
  created_by: UUID
  created_at: ISODateString
  updated_at: ISODateString
  clients?: Client
}

// ─── Inspections ─────────────────────────────────────────────────────────────

export type InspectionStatus = 'draft' | 'in_progress' | 'review_pending' | 'completed'

export interface Inspection {
  id: UUID
  property_id: UUID
  operator_id: UUID
  visit_date: ISODateString
  objective: string | null
  status: InspectionStatus
  general_observations: string | null
  created_at: ISODateString
  updated_at: ISODateString
  properties?: Property
}

// ─── Inspection Images ───────────────────────────────────────────────────────

export type ImageType =
  | 'overview'
  | 'pasture'
  | 'livestock'
  | 'bare_soil'
  | 'water'
  | 'fence'
  | 'waterer'
  | 'crop'
  | 'structure'
  | 'wetland'
  | 'other'

export interface InspectionImage {
  id: UUID
  inspection_id: UUID
  storage_path: string
  original_name: string
  image_type: ImageType | null
  field_observations: string | null
  order_index: number
  created_at: ISODateString
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export type AnnotationCategory =
  | 'bovine'
  | 'pasture'
  | 'bare_soil'
  | 'cattle_trail'
  | 'wetland'
  | 'fence'
  | 'waterer'
  | 'shade'
  | 'crop'
  | 'structure'
  | 'attention_point'

export type Priority = 'high' | 'medium' | 'low'
export type ConfidenceLevel = 'confirmed' | 'probable' | 'uncertain'

export interface ImageAnnotation {
  id: UUID
  image_id: UUID
  marker_number: number
  x_percent: number
  y_percent: number
  category: AnnotationCategory
  description: string | null
  priority: Priority
  confidence: ConfidenceLevel
  created_at: ISODateString
}

// ─── AI Analyses ─────────────────────────────────────────────────────────────

export type AnalysisStatus = 'draft' | 'review_pending' | 'approved' | 'rejected'

export interface AttentionPoint {
  category: AnnotationCategory
  description: string
  priority: Priority
  confidence: ConfidenceLevel
}

export interface AiAnalysis {
  id: UUID
  image_id: UUID
  inspection_id: UUID
  visible_elements: string[]
  attention_points: AttentionPoint[]
  limitations: string[]
  suggested_text: string | null
  raw_response: unknown
  status: AnalysisStatus
  reviewed_by: UUID | null
  reviewed_at: ISODateString | null
  reviewer_notes: string | null
  created_at: ISODateString
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportStatus = 'draft' | 'review_pending' | 'approved' | 'published'

export type ReportSectionType =
  | 'cover'
  | 'property_data'
  | 'objective'
  | 'image_gallery'
  | 'positive_observations'
  | 'attention_points'
  | 'limitations'
  | 'recommendations'
  | 'activities'
  | 'conclusion'
  | 'disclaimer'

export interface Report {
  id: UUID
  inspection_id: UUID
  title: string
  status: ReportStatus
  generated_by: UUID
  approved_by: UUID | null
  pdf_path: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface ReportSection {
  id: UUID
  report_id: UUID
  section_type: ReportSectionType
  title: string
  content: string | null
  order_index: number
}

// ─── Activities ──────────────────────────────────────────────────────────────

export type ActivityStatus = 'planned' | 'started' | 'done'

export type ActivityCategory =
  | 'fence'
  | 'waterer'
  | 'pasture'
  | 'soil'
  | 'livestock'
  | 'water'
  | 'structure'
  | 'inspection'
  | 'other'

export interface Activity {
  id: UUID
  inspection_id: UUID | null
  report_id: UUID | null
  annotation_id: UUID | null
  title: string
  description: string | null
  category: ActivityCategory | null
  priority: Priority
  status: ActivityStatus
  assigned_to: UUID | null
  due_date: ISODateString | null
  completed_at: ISODateString | null
  created_by: UUID
  created_at: ISODateString
  updated_at: ISODateString
}

export interface ActivityComment {
  id: UUID
  activity_id: UUID
  user_id: UUID
  content: string
  created_at: ISODateString
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarEventType = 'visit' | 'report_deadline' | 'activity' | 'revisit'

export interface CalendarEvent {
  id: UUID
  title: string
  event_type: CalendarEventType
  start_date: ISODateString
  end_date: ISODateString | null
  all_day: boolean
  inspection_id: UUID | null
  activity_id: UUID | null
  report_id: UUID | null
  created_by: UUID
  created_at: ISODateString
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | 'activity_overdue'
  | 'analysis_pending_review'
  | 'report_ready'
  | 'activity_due_soon'
  | 'invite'

export interface Notification {
  id: UUID
  user_id: UUID
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read_at: ISODateString | null
  created_at: ISODateString
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export interface MarkerData {
  id?: string
  marker_number: number
  x_percent: number
  y_percent: number
  category: string
  description: string | null
  priority: string
  confidence: string
}
