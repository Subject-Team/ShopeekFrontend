export interface User {
  id: string;
  phone?: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
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

export interface RequestOtpPayload {
  phone: string;
  turnstile_token?: string;
}

export interface RequestOtpResponse {
  is_registered: boolean;
  phone: string;
  expires_in?: number;
  has_active_code?: boolean;
  message: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface PasswordLoginPayload {
  phone_or_email: string;
  password: string;
  turnstile_token?: string;
}

export interface SignupRequestOtpPayload {
  phone: string;
  email: string;
  full_name: string;
  password: string;
  turnstile_token?: string;
}

export interface SignupVerifyOtpPayload {
  phone: string;
  code: string;
  email: string;
  full_name: string;
  password: string;
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
  phone?: string;
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
  success: boolean;
  message: string;
  advisory?: AIAdvisory;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'USER' | 'ASSISTANT';
  message_content: string;
  created_at: string;
}
