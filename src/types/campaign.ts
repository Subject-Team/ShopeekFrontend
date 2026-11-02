export type CampaignPerformanceStatus =
  | 'monitoring'
  | 'excellent'
  | 'profitable'
  | 'breakeven'
  | 'loss';

export interface CampaignMetrics {
  total_sales: number;
  baseline_sales: number;
  lift_sales: number;
  roas: number;
  new_customers_count: number;
  cac: number;
  is_active: boolean;
  performance_status: CampaignPerformanceStatus;
}

export interface AdCampaign {
  id: string;
  user_id: string;
  title: string;
  cost: number;
  currency: string;
  channel: string;
  start_date: string;
  end_date: string;
  impact_duration_preset?: string | null;
  notes?: string | null;
  created_at: string;
  metrics: CampaignMetrics;
}

export interface CampaignSummary {
  total_cost: number;
  total_lift: number;
  avg_roas: number;
  total_new_customers: number;
  active_campaigns_count: number;
}

export interface CampaignsOverview {
  campaigns: AdCampaign[];
  active_campaign: AdCampaign | null;
  summary: CampaignSummary;
}

export interface CampaignCreatePayload {
  title: string;
  cost: number;
  currency?: string;
  channel?: string;
  start_date: string;
  end_date: string;
  impact_duration_preset?: string;
  notes?: string;
}

export interface CampaignUpdatePayload {
  title?: string;
  cost?: number;
  channel?: string;
  start_date?: string;
  end_date?: string;
  impact_duration_preset?: string;
  notes?: string;
}
