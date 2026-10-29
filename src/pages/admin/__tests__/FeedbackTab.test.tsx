// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackTab } from '../FeedbackTab';
import * as api from '../../../services/api';
import type { AdminFeedbackListResponse } from '../../../types/admin';

vi.mock('../../../services/api', () => ({
  fetchAdminFeedback: vi.fn(),
  updateAdminFeedbackStatus: vi.fn(),
  grantAdminFeedbackReward: vi.fn(),
}));

const mockFeedbacksResponse: AdminFeedbackListResponse = {
  items: [
    {
      id: 'fb-1',
      user_id: 'user-1',
      user_email: 'user1@example.com',
      user_full_name: 'کاربر تستی',
      user_phone: '09121112233',
      type: 'bug_report',
      title: 'خطای فاکتور',
      description: 'فاکتور ذخیره نشد',
      page_url: '/dashboard/invoices',
      screenshot_data: null,
      status: 'pending',
      reward_amount: 0,
      admin_notes: null,
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    },
    {
      id: 'fb-2',
      user_id: 'user-2',
      user_email: 'user2@example.com',
      user_full_name: 'علی حسینی',
      user_phone: '09129998877',
      type: 'feature_request',
      title: 'افزودن پیامک فاکتور',
      description: 'امکان ارسال پیامک به خریدار',
      page_url: '/dashboard',
      screenshot_data: 'data:image/jpeg;base64,previewdata',
      status: 'rewarded',
      reward_amount: 50,
      admin_notes: 'پاداش ۵۰ اعتبار',
      created_at: '2026-10-28T09:00:00Z',
      updated_at: '2026-10-28T09:30:00Z',
    },
  ],
  total: 2,
  page: 1,
  page_size: 15,
};

describe('[page] FeedbackTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback list with items, category badges, and submitter details', async () => {
    vi.mocked(api.fetchAdminFeedback).mockResolvedValueOnce(mockFeedbacksResponse);

    render(<FeedbackTab />);

    expect(screen.getByText('در حال دریافت بازخوردها...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('خطای فاکتور')).toBeInTheDocument();
      expect(screen.getByText('افزودن پیامک فاکتور')).toBeInTheDocument();
    });

    expect(screen.getByText('کاربر تستی')).toBeInTheDocument();
    expect(screen.getByText('علی حسینی')).toBeInTheDocument();
    expect(screen.getByText('گزارش خطا')).toBeInTheDocument();
    expect(screen.getByText('قابلیت جدید')).toBeInTheDocument();
    expect(screen.getByText('+۵۰ اعتبار')).toBeInTheDocument();
  });

  it('filters feedbacks when category is changed', async () => {
    vi.mocked(api.fetchAdminFeedback).mockResolvedValue(mockFeedbacksResponse);

    render(<FeedbackTab />);

    await waitFor(() => {
      expect(screen.getByText('خطای فاکتور')).toBeInTheDocument();
    });

    const typeSelect = screen.getByDisplayValue('همه انواع');
    fireEvent.change(typeSelect, { target: { value: 'bug_report' } });

    await waitFor(() => {
      expect(api.fetchAdminFeedback).toHaveBeenCalledWith(1, 15, undefined, 'bug_report');
    });
  });

  it('opens reward modal and grants credit reward', async () => {
    vi.mocked(api.fetchAdminFeedback).mockResolvedValueOnce(mockFeedbacksResponse);
    vi.mocked(api.grantAdminFeedbackReward).mockResolvedValueOnce({
      ...mockFeedbacksResponse.items[0],
      status: 'rewarded',
      reward_amount: 25,
    });

    render(<FeedbackTab />);

    await waitFor(() => {
      expect(screen.getByText('خطای فاکتور')).toBeInTheDocument();
    });

    const rewardButtons = screen.getAllByRole('button', { name: /اعطای پاداش اعتبار/ });
    fireEvent.click(rewardButtons[0]);

    // Modal opens
    expect(screen.getByRole('heading', { name: 'اعطای پاداش اعتبار' })).toBeInTheDocument();

    // Submit reward
    fireEvent.click(screen.getByRole('button', { name: 'تایید و اعطای پاداش' }));

    await waitFor(() => {
      expect(api.grantAdminFeedbackReward).toHaveBeenCalledWith('fb-1', 25, undefined);
    });
  });
});
