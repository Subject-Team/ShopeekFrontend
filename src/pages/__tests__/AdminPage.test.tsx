import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';
import { AdminGuard } from '../AdminPage';
import type { AdminUserItem, AdminTransaction } from '../../types/admin';

vi.mock('../../services/api', () => ({
  fetchMeApi: vi.fn(),
  fetchAdminStats: vi.fn(),
  fetchAdminUsers: vi.fn(),
  fetchAdminUserDetail: vi.fn(),
  fetchAdminUserTransactions: vi.fn(),
  fetchAdminUserBilling: vi.fn(),
  fetchAdminPlans: vi.fn(),
  updateAdminUser: vi.fn(),
  deleteAdminUser: vi.fn(),
  restoreAdminUser: vi.fn(),
  fetchAdminErrors: vi.fn(),
  recordAdminPayment: vi.fn(),
  grantAdminCredits: vi.fn(),
  adjustAdminWallet: vi.fn(),
}));

// Silence expected console.error output from caught error paths.
vi.spyOn(console, 'error').mockImplementation(() => {});

const adminUser = { id: 'u-1', email: 'admin@test.com', full_name: 'Admin', role: 'Admin' };

const statsData = {
  total_users: 10,
  verified_users: 8,
  active_subscription_users: 7,
  read_only_users: 2,
  new_users_last_7d: 3,
  new_users_last_30d: 5,
  total_customers: 50,
  total_transactions: 200,
  total_revenue: 1000000,
  total_advisories: 12,
  total_forecasts: 12,
  business_profiles_completed: 6,
  total_error_events: 3,
  deleted_accounts: 4,
  deletion_queue_accounts: 2,
};

const makeUser = (overrides: Partial<AdminUserItem> = {}): AdminUserItem => ({
  id: 'u-2',
  email: 'pro@test.com',
  full_name: 'Pro User',
  phone: null,
  role: 'User',
  email_verified: true,
  phone_verified: true,
  plan_key: 'pro',
  subscription_status: 'active',
  subscription_expires_at: '2026-12-31T00:00:00',
  is_subscription_active: true,
  remaining_days: 30,
  is_read_only: false,
  monthly_balance: null,
  purchased_balance: null,
  created_at: '2026-01-01T00:00:00',
  customers_count: 5,
  transactions_count: 10,
  ...overrides,
});

const billingData = {
  billing: {
    plan: {
      key: 'pro',
      name_fa: 'پرو',
      status: 'active',
      remaining_days: 30,
      next_payment_due: '2026-12-31T00:00:00',
      current_period_started_at: '2026-01-01T00:00:00',
    },
    wallet: {
      monthly_balance: 100,
      purchased_balance: 50,
      pending_session_charge: 10,
      pending_account_charge: 5,
    },
    usage: [],
    ledger: [
      { amount: 100, source: 'admin_grant', feature_key: null, ref: null, created_at: '2026-01-01T00:00:00' },
    ],
    stats: { total_granted: 100, total_spent: 0, spend_by_feature: {} },
  },
  payments: [
    {
      id: 1,
      user_id: 'u-2',
      plan_key: 'pro',
      duration_months: 1,
      amount_toman: 500000,
      recorded_by: 'u-1',
      note: 'پرداخت نقدی',
      created_at: '2026-01-01T00:00:00',
    },
  ],
};

const renderGuard = async (initialEntries: string[] = ['/admin']) => {
  const { render, act } = await import('@testing-library/react');
  const result = render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <AdminGuard />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
  await act(async () => {});
  return result;
};

const renderAdminPage = async () => {
  localStorage.setItem('shopeek_token', 'mock-token');
  localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
  (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue(adminUser);
  (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue(statsData);
  return renderGuard();
};

const openUsersTab = async () => {
  await renderAdminPage();
  fireEvent.click(screen.getByText('کاربران'));
  await vi.waitFor(() => expect(api.fetchAdminUsers).toHaveBeenCalled());
  // Flush the resolved users list into the DOM (React defers the update when
  // it lands outside act, so the table would otherwise still show loading).
  await act(async () => {});
};

const openUserModal = async (
  user: AdminUserItem = makeUser(),
  transactions: { items: AdminTransaction[]; total: number } = { items: [], total: 0 }
) => {
  (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
    items: [user],
    total: 1,
    page: 1,
    page_size: 15,
  });
  (api.fetchAdminUserTransactions as ReturnType<typeof vi.fn>).mockResolvedValue(transactions);
  (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(billingData);
  (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue([{ key: 'pro', name_fa: 'پرو', is_active: true }]);
  (api.fetchAdminUserDetail as ReturnType<typeof vi.fn>).mockResolvedValue(user);
  await openUsersTab();
  const table = document.querySelector('table') as HTMLElement;
  const row = within(table).getByText(user.full_name).closest('tr') as HTMLElement;
  fireEvent.click(row);
  await vi.waitFor(() => expect(screen.getByText('تراکنش‌های اخیر')).toBeTruthy());
};

const modal = () => document.querySelector('.fixed.inset-0') as HTMLElement;

describe('AdminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects to /login when unauthenticated', async () => {
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('no session'));

    const { container } = await renderGuard();

    // After loading, should redirect to /login
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('/');
    });
  });

  it('renders NotFoundPage when user is not Admin', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'user@test.com', full_name: 'User', role: 'User' })
    );
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'u-1',
      email: 'user@test.com',
      full_name: 'User',
      role: 'User',
    });

    await renderGuard();

    await vi.waitFor(() => {
      expect(screen.getByText('صفحه مورد نظر یافت نشد')).toBeTruthy();
    });
  });

  it('renders admin page when user is Admin', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'admin@test.com', full_name: 'Admin', role: 'Admin' })
    );
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'u-1',
      email: 'admin@test.com',
      full_name: 'Admin',
      role: 'Admin',
    });
    (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      total_users: 10,
      verified_users: 8,
      active_subscription_users: 7,
      read_only_users: 2,
      new_users_last_7d: 3,
      new_users_last_30d: 5,
      total_customers: 50,
      total_transactions: 200,
      total_revenue: 1000000,
      total_advisories: 12,
      total_forecasts: 12,
      business_profiles_completed: 6,
      total_error_events: 3,
      deleted_accounts: 4,
      deletion_queue_accounts: 2,
    });

    await renderGuard();

    await vi.waitFor(() => {
      expect(screen.getByText('پنل مدیریت')).toBeTruthy();
      expect(screen.getByText('حساب‌های حذف‌شده')).toBeInTheDocument();
      expect(screen.getByText('در صف حذف')).toBeInTheDocument();
    });
  });

  it('shows loading screen while validating session', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    await renderGuard();

    expect(screen.getByText('در حال بارگذاری سامانه شاپیک...')).toBeTruthy();
  });
});

describe('StatsTab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows loading spinner while stats load', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue(adminUser);
    (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    await renderGuard();

    expect(document.querySelectorAll('.animate-spin').length).toBeGreaterThan(0);
  });

  it('shows error message when stats fail to load', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue(adminUser);
    (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

    await renderGuard();

    await vi.waitFor(() => expect(screen.getByText('خطا در بارگذاری آمار')).toBeTruthy());
  });

  it('renders all KPI cards with formatted values', async () => {
    await renderAdminPage();

    await vi.waitFor(() => expect(screen.getByText('کل کاربران')).toBeTruthy());
    expect(screen.getByText('کاربران تأییدشده')).toBeTruthy();
    expect(screen.getByText('اشتراک فعال')).toBeTruthy();
    expect(screen.getByText('فقط خواندنی')).toBeTruthy();
    expect(screen.getByText('کاربران جدید (۷ روز)')).toBeTruthy();
    expect(screen.getByText('کاربران جدید (۳۰ روز)')).toBeTruthy();
    expect(screen.getByText('کل مشتریان')).toBeTruthy();
    expect(screen.getByText('کل تراکنش‌ها')).toBeTruthy();
    expect(screen.getByText('کل درآمد')).toBeTruthy();
    expect(screen.getByText('مشاوره‌ها')).toBeTruthy();
    expect(screen.getByText('پیش‌بینی‌ها')).toBeTruthy();
    expect(screen.getByText('پروفایل تکمیل‌شده')).toBeTruthy();
    expect(screen.getByText('رویدادهای خطا')).toBeTruthy();
    expect(screen.getByText('در صف حذف')).toBeTruthy();
    expect(screen.getByText('حساب‌های حذف‌شده')).toBeTruthy();
    expect(screen.getByText('۱ میلیون تومان')).toBeTruthy();
    expect(screen.getByText('رشد کاربران جدید')).toBeTruthy();
  });
});

describe('UsersTab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows loading spinner while users load', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    await renderAdminPage();
    fireEvent.click(screen.getByText('کاربران'));

    expect(document.querySelectorAll('.animate-spin').length).toBeGreaterThan(0);
  });

  it('shows empty message when no users', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 15 });

    await openUsersTab();

    await vi.waitFor(() => expect(screen.getAllByText('کاربری یافت نشد').length).toBeGreaterThan(0));
  });

  it('shows empty state when users fetch fails', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

    await openUsersTab();

    await vi.waitFor(() => expect(screen.getAllByText('کاربری یافت نشد').length).toBeGreaterThan(0));
  });

  it('searches users with debounce', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 15 });

    await openUsersTab();
    fireEvent.change(screen.getByPlaceholderText('جستجو بر اساس نام، ایمیل یا تلفن...'), { target: { value: 'ali' } });

    await vi.waitFor(() => expect(api.fetchAdminUsers).toHaveBeenCalledWith('ali', 1, 15), { timeout: 2000 });
  });

  it('clears search with the X button', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 15 });

    await openUsersTab();
    fireEvent.change(screen.getByPlaceholderText('جستجو بر اساس نام، ایمیل یا تلفن...'), { target: { value: 'ali' } });
    await vi.waitFor(() => expect(api.fetchAdminUsers).toHaveBeenCalledWith('ali', 1, 15), { timeout: 2000 });

    const clearBtn = document.querySelector('button.absolute.left-3') as HTMLElement;
    fireEvent.click(clearBtn);

    await vi.waitFor(() => expect(api.fetchAdminUsers).toHaveBeenCalledWith('', 1, 15), { timeout: 2000 });
  });

  it('paginates through users', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [makeUser()],
      total: 30,
      page: 1,
      page_size: 15,
    });

    await openUsersTab();

    await vi.waitFor(() => expect(screen.getByText(/صفحه ۱ از ۲/)).toBeTruthy());
    const pagination = screen.getByText(/صفحه ۱ از ۲/).closest('div') as HTMLElement;
    const buttons = within(pagination).getAllByRole('button');
    expect(buttons[0]).toBeDisabled();

    fireEvent.click(buttons[1]);

    await vi.waitFor(() => expect(api.fetchAdminUsers).toHaveBeenCalledWith('', 2, 15));
  });

  it('renders plan cell variants', async () => {
    const users = [
      makeUser({ id: 'u-a', full_name: 'Exempt User', plan_key: 'exempt', subscription_status: 'exempt' }),
      makeUser({ id: 'u-b', full_name: 'No Plan User', plan_key: null, subscription_status: undefined }),
      makeUser({ id: 'u-c', full_name: 'Custom Plan User', plan_key: 'custom', subscription_status: 'active' }),
      makeUser({
        id: 'u-d',
        full_name: 'Expired User',
        plan_key: 'pro',
        subscription_status: 'expired',
        remaining_days: null,
        subscription_expires_at: '2026-01-01T00:00:00',
        is_subscription_active: false,
      }),
    ];
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({ items: users, total: 4, page: 1, page_size: 15 });

    await openUsersTab();

    await vi.waitFor(() => expect(screen.getAllByText('Custom Plan User').length).toBeGreaterThan(0));
    expect(screen.getAllByText('معاف').length).toBeGreaterThan(0);
    expect(screen.getByText('Custom')).toBeTruthy();
    expect(screen.getByText(/انقضا:/)).toBeTruthy();

    const table = document.querySelector('table') as HTMLElement;
    const noPlanRow = within(table).getByText('No Plan User').closest('tr') as HTMLElement;
    expect(within(noPlanRow).getAllByText('—').length).toBeGreaterThan(0);
  });
});

describe('UserDetailModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows user info and active subscription label', async () => {
    await openUserModal();

    await vi.waitFor(() => expect(within(modal()).getByText('فعال (۳۰ روز)')).toBeTruthy());
    expect(within(modal()).getByText('تاریخ عضویت')).toBeTruthy();
    expect(screen.getByText('ویرایش اطلاعات')).toBeTruthy();
  });

  it('shows read-only subscription label', async () => {
    const user = makeUser({ is_read_only: true, is_subscription_active: false });

    await openUserModal(user);

    await vi.waitFor(() => expect(within(modal()).getByText('فقط خواندنی')).toBeTruthy());
  });

  it('shows expired subscription label', async () => {
    const user = makeUser({ is_subscription_active: false, remaining_days: 0 });

    await openUserModal(user);

    await vi.waitFor(() => expect(within(modal()).getByText('منقضی‌شده')).toBeTruthy());
  });

  it('shows recent deletion banner', async () => {
    const user = makeUser({
      deleted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      is_deleted: true,
      is_subscription_active: false,
    });

    await openUserModal(user);

    await vi.waitFor(() => expect(screen.getByText(/روز پیش توسط کاربر حذف شده است/)).toBeTruthy());
    expect(within(modal()).getByText(/در صف حذف/)).toBeTruthy();
  });

  it('shows permanent deletion banner for old deletions', async () => {
    const user = makeUser({ deleted_at: '2026-01-01T00:00:00', is_deleted: true, is_subscription_active: false });

    await openUserModal(user);

    await vi.waitFor(() =>
      expect(
        screen.getByText('این حساب بیش از ۷ روز پیش حذف شده است و آماده پاکسازی دائمی دستی می‌باشد.')
      ).toBeTruthy()
    );
    expect(within(modal()).getByText('حذف شده (≥ ۷ روز)')).toBeTruthy();
  });

  it('shows user transactions', async () => {
    await openUserModal(makeUser(), {
      items: [{ id: 'tx-1', transaction_date: '2026-01-01T00:00:00', total_amount: 50000, product_name: 'محصول تست' }],
      total: 1,
    });

    await vi.waitFor(() => expect(screen.getByText('محصول تست')).toBeTruthy());
  });

  it('shows empty transactions message', async () => {
    await openUserModal();

    await vi.waitFor(() => expect(screen.getByText('تراکنشی یافت نشد')).toBeTruthy());
  });

  it('edits user name and saves', async () => {
    await openUserModal();
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));

    const nameInput = within(modal()).getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() =>
      expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', {
        full_name: 'New Name',
        subscription_expires_at: new Date('2026-12-31T00:00').toISOString(),
      })
    );
    await vi.waitFor(() => expect(screen.getByText('اطلاعات کاربر با موفقیت بروزرسانی شد')).toBeTruthy());
    await vi.waitFor(() => expect(api.fetchAdminUserDetail).toHaveBeenCalledWith('u-2'));
  });

  it('changes role and saves', async () => {
    await openUserModal();
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));

    const roleSelect = within(modal()).getAllByRole('combobox')[0];
    fireEvent.change(roleSelect, { target: { value: 'Admin' } });
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() =>
      expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', {
        role: 'Admin',
        subscription_expires_at: new Date('2026-12-31T00:00').toISOString(),
      })
    );
  });

  it('sets subscription to unlimited', async () => {
    await openUserModal();
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));

    fireEvent.click(within(modal()).getByRole('checkbox'));
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() => expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', { subscription_expires_at: null }));
  });

  it('updates subscription expiry date', async () => {
    await openUserModal();
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));

    const expiryInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    fireEvent.change(expiryInput, { target: { value: '2027-01-15T10:30' } });
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() =>
      expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', {
        subscription_expires_at: new Date('2027-01-15T10:30').toISOString(),
      })
    );
  });

  it('closes edit form without changes', async () => {
    await openUserModal(makeUser({ subscription_expires_at: null }));
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() => expect(api.updateAdminUser).not.toHaveBeenCalled());
    expect(screen.queryByText('انصراف')).toBeNull();
  });

  it('shows error toast when update fails', async () => {
    (api.updateAdminUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای بروزرسانی'));

    await openUserModal();
    fireEvent.click(screen.getByText('ویرایش اطلاعات'));
    fireEvent.change(within(modal()).getAllByRole('textbox')[0], { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('ذخیره'));

    await vi.waitFor(() => expect(screen.getByText('خطای بروزرسانی')).toBeTruthy());
  });

  it('toggles email verification off', async () => {
    (api.updateAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await openUserModal();
    fireEvent.click(screen.getByText('لغو تأیید ایمیل'));

    await vi.waitFor(() => expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', { email_verified: false }));
    await vi.waitFor(() => expect(screen.getByText('ایمیل تأیید نشد')).toBeTruthy());
  });

  it('toggles phone verification off', async () => {
    (api.updateAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await openUserModal();
    fireEvent.click(screen.getByText('لغو تأیید تلفن'));

    await vi.waitFor(() => expect(api.updateAdminUser).toHaveBeenCalledWith('u-2', { phone_verified: false }));
    await vi.waitFor(() => expect(screen.getByText('تلفن تأیید نشد')).toBeTruthy());
  });

  it('shows error toast when toggle fails', async () => {
    (api.updateAdminUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای تأیید'));

    await openUserModal();
    fireEvent.click(screen.getByText('لغو تأیید ایمیل'));

    await vi.waitFor(() => expect(screen.getByText('خطای تأیید')).toBeTruthy());
  });

  it('deletes a user after confirmation', async () => {
    await openUserModal();
    // The deleted user no longer exists, so the post-delete detail refresh
    // rejects and the modal closes instead of re-opening with stale data.
    (api.fetchAdminUserDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('deleted'));
    fireEvent.click(screen.getByText('حذف کاربر'));
    expect(screen.getByText('آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.')).toBeTruthy();

    fireEvent.click(screen.getByText('تأیید حذف'));

    await vi.waitFor(() => expect(api.deleteAdminUser).toHaveBeenCalledWith('u-2'));
    await vi.waitFor(() => expect(screen.getByText('کاربر با موفقیت حذف شد')).toBeTruthy());
    await vi.waitFor(() => expect(screen.queryByText('تراکنش‌های اخیر')).toBeNull());
  });

  it('cancels delete confirmation', async () => {
    await openUserModal();
    fireEvent.click(screen.getByText('حذف کاربر'));
    fireEvent.click(screen.getByText('انصراف'));

    expect(screen.queryByText('آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.')).toBeNull();
    expect(api.deleteAdminUser).not.toHaveBeenCalled();
  });

  it('shows error toast when delete fails', async () => {
    (api.deleteAdminUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای حذف'));

    await openUserModal();
    fireEvent.click(screen.getByText('حذف کاربر'));
    fireEvent.click(screen.getByText('تأیید حذف'));

    await vi.waitFor(() => expect(screen.getByText('خطای حذف')).toBeTruthy());
  });

  it('restores a deleted user', async () => {
    const user = makeUser({
      deleted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      is_deleted: true,
      is_subscription_active: false,
    });

    await openUserModal(user);
    fireEvent.click(screen.getByText('بازیابی حساب کاربری'));

    await vi.waitFor(() => expect(api.restoreAdminUser).toHaveBeenCalledWith('u-2'));
    await vi.waitFor(() => expect(screen.getByText('حساب کاربر با موفقیت بازیابی شد.')).toBeTruthy());
  });

  it('shows error toast when restore fails', async () => {
    const user = makeUser({
      deleted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      is_deleted: true,
      is_subscription_active: false,
    });
    (api.restoreAdminUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای بازیابی'));

    await openUserModal(user);
    fireEvent.click(screen.getByText('بازیابی حساب کاربری'));

    await vi.waitFor(() => expect(screen.getByText('خطای بازیابی')).toBeTruthy());
  });

  it('disables destructive actions for own account', async () => {
    const self = makeUser({ id: 'u-1', full_name: 'Admin', email: 'admin@test.com' });

    await openUserModal(self);

    expect(screen.getByText('حساب خودتان — حذف و تغییر نقش غیرفعال است')).toBeTruthy();
    expect(screen.queryByText('حذف کاربر')).toBeNull();
    expect(screen.getByText('لغو تأیید ایمیل').closest('button')).toBeDisabled();
  });

  it('closes the modal', async () => {
    await openUserModal();
    fireEvent.click(within(modal()).getAllByRole('button')[0]);

    await vi.waitFor(() => expect(screen.queryByText('تراکنش‌های اخیر')).toBeNull());
  });
});

describe('ErrorsTab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const errorEvent = {
    id: 'e-1',
    user_id: 'u-2',
    source: 'http',
    severity: 'critical',
    code: 'ERR_1',
    message: 'خطای بحرانی',
    detail: 'جزئیات خطا',
    created_at: '2026-01-01T00:00:00',
  };

  const openErrorsTab = async () => {
    await renderAdminPage();
    fireEvent.click(screen.getByText('خطاها'));
    await vi.waitFor(() => expect(api.fetchAdminErrors).toHaveBeenCalled());
  };

  it('shows loading spinner while errors load', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    await renderAdminPage();
    fireEvent.click(screen.getByText('خطاها'));

    expect(document.querySelectorAll('.animate-spin').length).toBeGreaterThan(0);
  });

  it('shows empty message when no errors', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });

    await openErrorsTab();

    await vi.waitFor(() => expect(screen.getByText('خطایی یافت نشد')).toBeTruthy());
  });

  it('renders error events and expands details', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [errorEvent],
      total: 1,
      page: 1,
      page_size: 20,
    });

    await openErrorsTab();

    await vi.waitFor(() => expect(screen.getByText('ERR_1')).toBeTruthy());
    expect(screen.getByText('critical')).toBeTruthy();
    expect(screen.getByText('خطای بحرانی')).toBeTruthy();

    fireEvent.click(screen.getByText('ERR_1'));

    await vi.waitFor(() => expect(screen.getByText('جزئیات خطا')).toBeTruthy());
    expect(screen.getByText('u-2')).toBeTruthy();
  });

  it('filters by severity', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });

    await openErrorsTab();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'critical' } });

    await vi.waitFor(() => expect(api.fetchAdminErrors).toHaveBeenCalledWith(1, 20, 'critical', undefined));
  });

  it('filters by source', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });

    await openErrorsTab();
    fireEvent.change(screen.getByPlaceholderText('منبع (مثلاً auth, api)'), { target: { value: 'auth' } });

    await vi.waitFor(() => expect(api.fetchAdminErrors).toHaveBeenCalledWith(1, 20, undefined, 'auth'));
  });

  it('paginates error events', async () => {
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [errorEvent],
      total: 25,
      page: 1,
      page_size: 20,
    });

    await openErrorsTab();

    await vi.waitFor(() => expect(screen.getByText(/صفحه ۱ از ۲/)).toBeTruthy());
    const pagination = screen.getByText(/صفحه ۱ از ۲/).closest('div') as HTMLElement;
    const buttons = within(pagination).getAllByRole('button');

    fireEvent.click(buttons[1]);

    await vi.waitFor(() => expect(api.fetchAdminErrors).toHaveBeenCalledWith(2, 20, undefined, undefined));
  });
});

describe('AdminPage tabs', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('switches between stats, users and errors tabs', async () => {
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 15 });
    (api.fetchAdminErrors as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });

    await renderAdminPage();

    await vi.waitFor(() => expect(screen.getByText('کل کاربران')).toBeTruthy());

    fireEvent.click(screen.getByText('کاربران'));
    await vi.waitFor(() => expect(screen.getByPlaceholderText('جستجو بر اساس نام، ایمیل یا تلفن...')).toBeTruthy());

    fireEvent.click(screen.getByText('خطاها'));
    await vi.waitFor(() => expect(screen.getByPlaceholderText('منبع (مثلاً auth, api)')).toBeTruthy());

    fireEvent.click(screen.getByText('آمار'));
    await vi.waitFor(() => expect(screen.getByText('کل کاربران')).toBeTruthy());
  });
});

describe('UsersTab plan column', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders plan label, status badge and remaining days in the plan cell', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'admin@test.com', full_name: 'Admin', role: 'Admin' })
    );
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'u-1',
      email: 'admin@test.com',
      full_name: 'Admin',
      role: 'Admin',
    });
    (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      total_users: 1,
      verified_users: 1,
      active_subscription_users: 1,
      read_only_users: 0,
      new_users_last_7d: 0,
      new_users_last_30d: 0,
      total_customers: 5,
      total_transactions: 10,
      total_revenue: 100000,
      total_advisories: 0,
      total_forecasts: 0,
      business_profiles_completed: 0,
      total_error_events: 0,
    });
    (api.fetchAdminUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [
        {
          id: 'u-2',
          email: 'pro@test.com',
          full_name: 'Pro User',
          phone: null,
          role: 'User',
          email_verified: true,
          phone_verified: true,
          plan_key: 'pro',
          subscription_status: 'active',
          subscription_expires_at: '2026-12-31T00:00:00',
          is_subscription_active: true,
          remaining_days: 30,
          is_read_only: false,
          monthly_balance: null,
          purchased_balance: null,
          created_at: '2026-01-01T00:00:00',
          customers_count: 5,
          transactions_count: 10,
        },
      ],
      total: 1,
      page: 1,
      page_size: 15,
    });

    await renderGuard();

    fireEvent.click(screen.getByText('کاربران'));

    await vi.waitFor(() => {
      expect(screen.getByText('طرح')).toBeTruthy();
      expect(screen.getByText('پرو')).toBeTruthy();
    });

    const planCell = screen.getByText('پرو').closest('td') as HTMLElement;
    expect(within(planCell).getByText('فعال')).toBeTruthy();
    expect(within(planCell).getByText('۳۰ روز مانده')).toBeTruthy();
  });
});