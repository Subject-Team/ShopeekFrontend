import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DataTransferCard } from '../DataTransferCard';
import { ToastProvider } from '../../../context/ToastContext';
import * as authContext from '../../../context/AuthContext';
import * as api from '../../../services/api';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../services/api', () => ({
  exportUserDataApi: vi.fn(),
  fetchPublicPlans: vi.fn(),
  fetchSampleDataApi: vi.fn(),
  importUserDataApi: vi.fn(),
}));

const mockPaidUser = {
  id: 'u-paid',
  email: 'paid@shopeek.ir',
  full_name: 'کاربر ویژه',
  role: 'User',
  plan_key: 'pro',
  subscription_status: 'active',
  is_subscription_active: true,
  is_read_only: false,
  created_at: '2026-01-01T00:00:00',
};

const mockTrialUser = {
  id: 'u-trial',
  email: 'trial@shopeek.ir',
  full_name: 'کاربر آزمایشی',
  role: 'User',
  plan_key: 'trial',
  subscription_status: 'trial',
  is_subscription_active: true,
  is_read_only: false,
  created_at: '2026-01-01T00:00:00',
};

const plansWithImportExport = (enabled: boolean) => [
  {
    key: 'lite',
    name_fa: 'لایت',
    sort_order: 1,
    monthly_credit_grant: 0,
    prices: [],
    features: [{ feature_key: 'import_export', enabled, limit_value: null, payg_cost: null }],
  },
  {
    key: 'pro',
    name_fa: 'پرو',
    sort_order: 2,
    monthly_credit_grant: 0,
    prices: [],
    features: [{ feature_key: 'import_export', enabled, limit_value: null, payg_cost: null }],
  },
];

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <DataTransferCard />
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('DataTransferCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    (api.fetchPublicPlans as any).mockResolvedValue([
      ...plansWithImportExport(true),
      {
        key: 'trial',
        name_fa: 'آزمایشی',
        sort_order: 0,
        monthly_credit_grant: 0,
        prices: [],
        features: [
          { feature_key: 'import_export', enabled: false, limit_value: null, payg_cost: null },
        ],
      },
    ]);
  });

  it('renders trial restriction banner and disables buttons for trial user', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockTrialUser });
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/قابلیت خروجی و ورودی داده برای طرح حساب شما فعال نیست/)
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'مشاهده و ارتقای اشتراک' })).toHaveAttribute(
      'href',
      '/dashboard/subscription'
    );

    const exportBtn = screen.getByRole('button', { name: /دریافت نسخه پشتیبان/ });
    const importBtn = screen.getByRole('button', { name: /انتخاب فایل و بازیابی اطلاعات/ });

    expect(exportBtn).toBeDisabled();
    expect(importBtn).toBeDisabled();
  });

  it('renders enabled buttons for paid user without restriction banner', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    renderComponent();

    await waitFor(() => {
      expect(api.fetchPublicPlans).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText(/قابلیت خروجی و ورودی داده برای طرح حساب شما فعال نیست/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/خروجی و ورودی داده‌ها ویژه کاربران طرح‌های فعال/)
    ).not.toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /دریافت نسخه پشتیبان/ });
    const importBtn = screen.getByRole('button', { name: /انتخاب فایل و بازیابی اطلاعات/ });

    expect(exportBtn).toBeEnabled();
    expect(importBtn).toBeEnabled();
  });

  it('locks data transfer for a paid user whose plan disables the feature', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    (api.fetchPublicPlans as any).mockResolvedValue(plansWithImportExport(false));
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/قابلیت خروجی و ورودی داده برای طرح حساب شما فعال نیست/)
      ).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /دریافت نسخه پشتیبان/ });
    const importBtn = screen.getByRole('button', { name: /انتخاب فایل و بازیابی اطلاعات/ });

    expect(exportBtn).toBeDisabled();
    expect(importBtn).toBeDisabled();
  });

  it('triggers export API and download when export button is clicked by paid user', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    const mockBlob = new Blob(['{}'], { type: 'application/json' });
    (api.exportUserDataApi as any).mockResolvedValue(mockBlob);

    renderComponent();

    const exportBtn = screen.getByRole('button', { name: /دریافت نسخه پشتیبان/ });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(api.exportUserDataApi).toHaveBeenCalledTimes(1);
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('toggles sample data structure preview', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    const samplePayload = {
      version: '1.0',
      business_profile: { category: 'clothing' },
      customers: [],
      sales_transactions: [],
    };
    (api.fetchSampleDataApi as any).mockResolvedValue(samplePayload);

    renderComponent();

    const toggleBtn = screen.getByRole('button', { name: 'مشاهده ساختار' });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(api.fetchSampleDataApi).toHaveBeenCalledTimes(1);
      expect(screen.getByText('shopeek_backup_schema.json')).toBeInTheDocument();
    });

    expect(screen.getByText('بستن پیش‌نمایش')).toBeInTheDocument();

    // Toggle off
    fireEvent.click(screen.getByRole('button', { name: 'بستن پیش‌نمایش' }));
    expect(screen.queryByText('shopeek_backup_schema.json')).not.toBeInTheDocument();
  });

  it('downloads sample data when download sample button is clicked', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    (api.fetchSampleDataApi as any).mockResolvedValue({ version: '1.0' });

    renderComponent();

    const downloadSampleBtn = screen.getByRole('button', { name: 'دانلود فایل نمونه' });
    fireEvent.click(downloadSampleBtn);

    await waitFor(() => {
      expect(api.fetchSampleDataApi).toHaveBeenCalledTimes(1);
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('opens confirmation modal on JSON file selection and performs import on confirm', async () => {
    (authContext.useAuth as any).mockReturnValue({ user: mockPaidUser });
    (api.importUserDataApi as any).mockResolvedValue({
      message: 'اطلاعات با موفقیت جایگزین شد',
      imported_transactions: 5,
      imported_customers: 2,
      imported_interactions: 1,
      business_profile_updated: true,
    });

    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(['{"version":"1.0"}'], 'backup.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Confirmation modal should now be visible
    await waitFor(() => {
      expect(screen.getByText('آیا از جایگزینی کامل اطلاعات اطمینان دارید؟')).toBeInTheDocument();
    });
    expect(screen.getByText('backup.json')).toBeInTheDocument();

    // Click confirm in modal
    const confirmBtn = screen.getByRole('button', { name: 'تأیید و جایگزینی داده‌ها' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.importUserDataApi).toHaveBeenCalledWith(file);
    });

    // Modal should close
    await waitFor(() => {
      expect(
        screen.queryByText('آیا از جایگزینی کامل اطلاعات اطمینان دارید؟')
      ).not.toBeInTheDocument();
    });
  });
});
