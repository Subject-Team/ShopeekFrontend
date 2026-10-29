// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, render, act, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../../context/ToastContext';
import { TelegramAlertsSection } from '../TelegramAlertsSection';
import * as api from '../../../services/api';
import type { AdminAlertRecipient, AdminCandidateUser } from '../../../types/admin';

vi.mock('../../../services/api', () => ({
  fetchAdminAlertRecipients: vi.fn(),
  createAdminAlertRecipient: vi.fn(),
  updateAdminAlertRecipient: vi.fn(),
  deleteAdminAlertRecipient: vi.fn(),
  sendAdminAlertTest: vi.fn(),
  sendAdminAlertBroadcast: vi.fn(),
  fetchAdminCandidateUsers: vi.fn(),
}));

const mockRecipients: AdminAlertRecipient[] = [
  {
    id: 'rec-1',
    user_id: 'user-1',
    user_name: 'محمد محمدی',
    user_email: 'mohammad@test.com',
    user_phone: '09121111111',
    telegram_chat_id: '12345678',
    label: 'مدیر سیستم',
    is_active: true,
    created_at: '2026-10-29T12:00:00',
    updated_at: null,
  },
  {
    id: 'rec-2',
    user_id: 'user-2',
    user_name: 'سارا رضایی',
    user_email: 'sara@test.com',
    user_phone: null,
    telegram_chat_id: '87654321',
    label: 'پشتیبانی',
    is_active: false,
    created_at: '2026-10-29T12:30:00',
    updated_at: null,
  },
];

const mockCandidates: AdminCandidateUser[] = [
  {
    id: 'user-3',
    full_name: 'علی احمدی',
    email: 'ali@test.com',
    phone: '09123333333',
    has_telegram_session: true,
    telegram_chat_id: '999888777',
    is_recipient: false,
  },
];

const renderSection = async () => {
  const result = render(
    <ToastProvider>
      <TelegramAlertsSection />
    </ToastProvider>
  );
  await act(async () => {});
  return result;
};

describe('[page] TelegramAlertsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchAdminAlertRecipients as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: mockRecipients,
      total: 2,
    });
    (api.fetchAdminCandidateUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockCandidates);
  });

  it('renders header with active recipients count', async () => {
    await renderSection();
    expect(screen.getByText('سیستم هشدار و پیام‌رسانی تلگرام')).toBeTruthy();
    expect(screen.getByText('۱ گیرنده فعال')).toBeTruthy();
  });

  it('expands panel and shows recipients list', async () => {
    await renderSection();
    const toggleBtn = screen.getByText('مدیریت و پیام‌رسانی');
    fireEvent.click(toggleBtn);

    expect(screen.getAllByText('محمد محمدی').length).toBeGreaterThan(0);
    expect(screen.getByText('سارا رضایی')).toBeTruthy();
    expect(screen.getByText(/شناسه چت: 12345678/)).toBeTruthy();

  });

  it('toggles recipient active status', async () => {
    (api.updateAdminAlertRecipient as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockRecipients[0],
      is_active: false,
    });

    await renderSection();
    fireEvent.click(screen.getByText('مدیریت و پیام‌رسانی'));

    const activeBtn = screen.getByText('فعال');
    fireEvent.click(activeBtn);

    await waitFor(() => {
      expect(api.updateAdminAlertRecipient).toHaveBeenCalledWith('rec-1', { is_active: false });
    });
  });

  it('sends test alert when test button clicked', async () => {
    (api.sendAdminAlertTest as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      sent_count: 1,
      failed_count: 0,
      message: 'پیام تست با موفقیت ارسال شد',
    });

    await renderSection();
    const testBtn = screen.getByText('ارسال هشدار تست');
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(api.sendAdminAlertTest).toHaveBeenCalled();
    });
  });

  it('sends broadcast message from admin form', async () => {
    (api.sendAdminAlertBroadcast as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      sent_count: 1,
      failed_count: 0,
      total: 1,
    });

    await renderSection();
    fireEvent.click(screen.getByText('مدیریت و پیام‌رسانی'));

    const textarea = screen.getByPlaceholderText(/متن پیام را اینجا بنویسید/);
    fireEvent.change(textarea, { target: { value: 'اطلاعیه مهم سامانه' } });

    const sendBtn = screen.getByText('ارسال پیام تلگرام');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(api.sendAdminAlertBroadcast).toHaveBeenCalledWith({
        message: 'اطلاعیه مهم سامانه',
        recipient_ids: undefined,
      });
    });
  });

  it('opens add recipient modal and adds candidate', async () => {
    (api.createAdminAlertRecipient as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'rec-3',
      user_id: 'user-3',
      user_name: 'علی احمدی',
      user_email: 'ali@test.com',
      telegram_chat_id: '999888777',
      is_active: true,
      created_at: '2026-10-29T14:00:00',
    });

    await renderSection();
    fireEvent.click(screen.getByText('مدیریت و پیام‌رسانی'));

    const addBtn = screen.getByText('افزودن کاربر');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('افزودن کاربر به گیرندگان هشدار تلگرام')).toBeTruthy();
      expect(screen.getByText('علی احمدی')).toBeTruthy();
    });

    // Click candidate
    fireEvent.click(screen.getByText('علی احمدی'));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /افزودن گیرنده/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createAdminAlertRecipient).toHaveBeenCalledWith({
        user_id: 'user-3',
        telegram_chat_id: '999888777',
        label: 'علی احمدی',
        is_active: true,
      });
    });
  });
});
