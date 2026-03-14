export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  job_title: string | null
  monthly_target: number
  role: 'engineer' | 'admin'
  status: 'pending' | 'active' | 'deactivated'
  transferred_to: string | null
  theme_preference: 'light' | 'dark'
  has_seen_welcome: boolean
  created_at: string
}

export type Client = {
  id: string
  name: string
  phone: string | null
  email: string | null
  company: string | null
  notes: string | null
  engineer_id: string
  created_at: string
}

export type Deal = {
  id: string
  title: string
  value: number
  status: 'new' | 'in_progress' | 'won' | 'lost'
  client_id: string
  engineer_id: string
  expected_close_date: string | null
  notes: string | null
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string
  message: string
  is_read: boolean
  related_deal_id: string | null
  created_at: string
}

export type Badge = {
  id: string
  engineer_id: string
  badge_key: string
  awarded_at: string
}

export type TeamTarget = {
  id: string
  month: number
  year: number
  total_target: number
  created_by: string
  created_at: string
}

export type MeetingPrep = {
  id: string
  client_id: string | null
  title: string
  client_name: string | null
  sector: string | null
  meeting_date: string | null
  status: string
  idea_raw: string | null
  analysis_result: any | null
  tags: string | null
  created_at: string
}

export type Score = {
  id: number
  client_id: string
  budget_score: number
  authority_score: number
  need_score: number
  timeline_score: number
  fit_score: number
  total_score: number
  created_at: string
}

export type File = {
  id: string
  client_id: string
  file_name: string
  file_path: string
  file_type_label: string
  uploaded_at: string
}
