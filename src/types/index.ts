export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  created_at: string;
  subscription_expires_at?: string | null;
  is_subscription_active?: boolean;
  is_infinite_subscription?: boolean;
  remaining_days?: number | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  is_read_only?: boolean;
  restriction_reasons?: string[];
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  user: User;
  web_session_id?: string | null;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
  turnstile_token?: string;
  device_id?: string;
  device_label?: string;
}

export interface OtpSendPayload {
  phone: string;
  turnstile_token?: string;
}

export interface OtpSendResponse {
  sent: boolean;
  message_id?: number | null;
  registered: boolean;
}

export interface OtpVerifyPayload {
  phone: string;
  code: string;
  turnstile_token?: string;
}

export interface OtpVerifyResponse {
  phone: string;
  verified: boolean;
  message: string;
  registered: boolean;
}

export interface RegisterWithPhonePayload {
  phone: string;
  code: string;
  email: string;
  password: string;
  full_name: string;
  turnstile_token?: string;
  device_id?: string;
  device_label?: string;
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

export interface WebSession {
  id: string;
  device_id: string;
  device_label: string;
  user_agent?: string | null;
  ip?: string | null;
  login_at: string;
  last_seen_at: string;
}

export interface TelegramSession {
  id: string;
  telegram_chat_id: string;
  created_at: string;
}

export interface SettingsData {
  profile: User;
  web_sessions: WebSession[];
  telegram_sessions: TelegramSession[];
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
  access_token?: string | null;
  refresh_token?: string | null;
}

export interface SalesSuggestions {
  products: { last: string | null; top3: string[]; names: string[] };
  customers: { last: string | null; top3: string[]; items: { id: string; name: string; email?: string | null }[] };
}

export interface CreateInvoicePayload {
  product_name: string;
  customer_name: string;
  customer_email?: string;
  total_amount: number; // thousand-toman; server multiplies by 1000
  transaction_date?: string; // 'today' | 'yesterday' | yyyy-mm-dd
}

export interface InvoiceResult {
  transaction_reference: string;
  product_name: string;
  customer_name: string;
  customer_email?: string | null;
  total_amount: number;
  transaction_date: string;
}
