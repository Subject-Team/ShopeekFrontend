export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  is_email_verified?: boolean;
  email_verified_at?: string | null;
  subscription_expires_at?: string | null;
  is_subscription_active?: boolean;
  is_infinite_subscription?: boolean;
  remaining_days?: number | null;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  email: string;
  requires_verification: boolean;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResendVerificationPayload {
  email: string;
  turnstile_token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  turnstile_token?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  turnstile_token?: string;
}

export interface KPISummary {
  total_revenue: number;
  revenue_change_percentage: number;
  revenue_change_absolute: number;
  order_count: number;
  order_count_change_percentage: number;
  average_order_value: number;
  aov_change_percentage: number;
  total_customers: number;
  customer_count_change_percentage: number;
  revenue_forecast?: number | null;
  order_count_forecast?: number | null;
  aov_forecast?: number | null;
  customer_count_forecast?: number | null;
}

export interface RevenuePoint {
  date: string;
  revenue: number | null;
  orders: number;
  forecast_revenue?: number | null;
}

export interface Interaction {
  id: string;
  customer_id: string;
  interaction_type: 'NOTE' | 'CALL' | 'EMAIL';
  content: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_lifetime_value: number;
  created_at: string;
  interactions_count: number;
  transactions_count: number;
  interactions?: Interaction[];
}

export interface AIAdvisory {
  id: string;
  user_id: string;
  has_recommendation: boolean;
  summary: string;
  recommendation_text: string;
  trigger_type: string;
  generated_at?: string;
}

export interface AdvisoryTriggerResult {
  advisory: { success: boolean; message: string };
  forecast: { success: boolean; count: number };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'USER' | 'ASSISTANT';
  message_content: string;
  created_at: string;
}
