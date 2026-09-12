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
