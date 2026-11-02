import type {
  CampaignsOverview,
  AdCampaign,
  CampaignCreatePayload,
  CampaignUpdatePayload,
} from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const fetchCampaignsOverview = async (): Promise<CampaignsOverview> => {
  const res = await authFetch(`${API_BASE}/campaigns`);
  if (!res.ok) throw new Error('خطا در دریافت لیست کمپین‌های تبلیغاتی');
  return res.json();
};

export const createCampaign = async (
  payload: CampaignCreatePayload
): Promise<AdCampaign> => {
  const res = await authFetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'خطا در ثبت کمپین جدید');
  }
  return res.json();
};

export const fetchCampaign = async (campaignId: string): Promise<AdCampaign> => {
  const res = await authFetch(`${API_BASE}/campaigns/${campaignId}`);
  if (!res.ok) throw new Error('خطا در دریافت جزییات کمپین');
  return res.json();
};

export const updateCampaign = async (
  campaignId: string,
  payload: CampaignUpdatePayload
): Promise<AdCampaign> => {
  const res = await authFetch(`${API_BASE}/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'خطا در ویرایش کمپین');
  }
  return res.json();
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  const res = await authFetch(`${API_BASE}/campaigns/${campaignId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('خطا در حذف کمپین');
};
