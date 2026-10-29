export interface AdminStats {
  total_users: number;
  verified_users: number;
  active_subscription_users: number;
  read_only_users: number;
  new_users_last_7d: number;
  new_users_last_30d: number;
  total_customers: number;
  total_transactions: number;
  total_revenue: number;
  total_advisories: number;
  total_forecasts: number;
  business_profiles_completed: number;
  total_error_events: number;
  deleted_accounts?: number;
  deletion_queue_accounts?: number;
  deleted_over_7d_accounts?: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  email_verified: boolean;
  phone_verified: boolean;
  plan_key?: string | null;
  subscription_status?: string;
  subscription_expires_at?: string | null;
  is_subscription_active: boolean;
  remaining_days?: number | null;
  is_read_only: boolean;
  monthly_balance?: number | null;
  purchased_balance?: number | null;
  created_at: string;
  customers_count: number;
  transactions_count: number;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminTransaction {
  id: string;
  transaction_date: string;
  total_amount?: number;
  product_name?: string;
  customer_name?: string;
  [key: string]: unknown;
}

export interface AdminTransactionsResponse {
  items: AdminTransaction[];
  total: number;
}

export interface AdminErrorEvent {
  id: string;
  user_id: string;
  source: string;
  severity: string;
  code: string;
  message: string;
  detail?: string | null;
  created_at: string;
}

export interface AdminErrorsResponse {
  items: AdminErrorEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminUserUpdatePayload {
  subscription_expires_at?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  full_name?: string;
  role?: 'User' | 'Admin';
}

export interface AdminFeedbackItem {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_full_name?: string | null;
  user_phone?: string | null;
  type: 'bug_report' | 'feature_request' | 'improvement';
  title: string;
  description: string;
  page_url?: string | null;
  screenshot_data?: string | null;
  status: 'pending' | 'reviewed' | 'rewarded' | 'closed';
  reward_amount: number;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminFeedbackListResponse {
  items: AdminFeedbackItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminAlertRecipient {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string | null;
  telegram_chat_id: string;
  label?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminAlertRecipientListResponse {
  items: AdminAlertRecipient[];
  total: number;
}

export interface AdminAlertRecipientCreatePayload {
  user_id: string;
  telegram_chat_id?: string;
  label?: string;
  is_active?: boolean;
}

export interface AdminAlertRecipientPatchPayload {
  telegram_chat_id?: string;
  label?: string;
  is_active?: boolean;
}

export interface AdminAlertBroadcastPayload {
  message: string;
  recipient_ids?: string[];
}

export interface AdminAlertBroadcastResponse {
  ok: boolean;
  sent_count: number;
  failed_count: number;
  total: number;
}

export interface AdminAlertTestResponse {
  ok: boolean;
  sent_count: number;
  failed_count: number;
  message: string;
}

export interface AdminCandidateUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  has_telegram_session: boolean;
  telegram_chat_id?: string | null;
  is_recipient: boolean;
}

