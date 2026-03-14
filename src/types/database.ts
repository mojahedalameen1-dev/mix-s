export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  job_title: string | null;
  monthly_target: number;
  role: 'engineer' | 'admin';
  status: 'pending' | 'active' | 'deactivated';
  transferred_to: string | null;
  theme_preference: 'light' | 'dark';
  has_seen_welcome: boolean;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  engineer_id: string;
  created_at: string;
};

export type Deal = {
  id: string;
  title: string;
  value: number;
  status: 'new' | 'in_progress' | 'won' | 'lost';
  client_id: string;
  engineer_id: string;
  expected_close_date: string | null;
  notes: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  related_deal_id: string | null;
  created_at: string;
};

export type Badge = {
  id: string;
  engineer_id: string;
  badge_key: string;
  awarded_at: string;
};

export type InviteLink = {
  id: string;
  token: string;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
};

export type TeamTarget = {
  id: string;
  month: number;
  year: number;
  total_target: number;
  created_by: string;
  created_at: string;
};
