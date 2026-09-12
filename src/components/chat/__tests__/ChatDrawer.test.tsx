import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChatDrawer } from '../ChatDrawer';
import { PageContextProvider, usePageContext } from '../../../context/PageContext';
import { AuthProvider } from '../../../context/AuthContext';
import * as api from '../../../services/api';
import type { ChatMessage, BillingOverview, BillingWallet } from '../../../types';

vi.mock('../../../services/api', () => ({
  fetchChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
  clearChatHistory: vi.fn(),
  fetchBillingOverview: vi.fn().mockResolvedValue({
    plan: { status: 'exempt' },
    wallet: null,
    usage: [],
    ledger: [],
    stats: {},
  }),
}));

const makeBilling = (wallet: BillingWallet | null): BillingOverview => ({
  plan: {
    key: null,
    name_fa: null,
    status: wallet ? 'active' : 'exempt',
    is_exempt: !wallet,
    remaining_days: null,
    next_payment_due: null,
    current_period_started_at: null,
  },
  wallet,
  usage: [],
  ledger: [],
  stats: { total_granted: 0, total_spent: 0, spend_by_feature: {} },
});

const makeMsg = (partial: Partial<ChatMessage>): ChatMessage => ({
  id: Math.random().toString(),
  session_id: 'session_default_user',
  sender: 'ASSISTANT',
  message_content: '',
  created_at: new Date().toISOString(),
  ...partial,
});

const TestWrapper: React.FC = () => {
  const { setIsChatOpen } = usePageContext();
  return (
    <div>
      <button onClick={() => setIsChatOpen(true)}>Open Chat</button>
      <ChatDrawer />
    </div>
  );
};

const openChat = async () => {
  render(
    <AuthProvider>
      <PageContextProvider>
        <TestWrapper />
      </PageContextProvider>
    </AuthProvider>
  );
  fireEvent.click(screen.getByText('Open Chat'));
  await act(async () => {});
};

describe('ChatDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchChatHistory as any).mockResolvedValue([]);
    (api.fetchBillingOverview as any).mockResolvedValue(makeBilling(null));
  });

  it('renders chat drawer and sends message', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([]);
    (api.sendChatMessage as any).mockResolvedValue(
      makeMsg({ message_content: 'پاسخ هوش مصنوعی به سوال شما' })
    );

    await openChat();

    await waitFor(() => {
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('سوال خود درباره فروش را بپرسید...');
    fireEvent.change(input, { target: { value: 'وضعیت فروش این ماه چطوره؟' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('وضعیت فروش این ماه چطوره؟')).toBeInTheDocument();
      expect(screen.getByText('پاسخ هوش مصنوعی به سوال شما')).toBeInTheDocument();
    });
  });

  it('renders markdown in assistant messages only', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([
      makeMsg({
        sender: 'USER',
        message_content: 'این *متن* کاربر است',
      }),
      makeMsg({
        sender: 'ASSISTANT',
        message_content: '**نکته مهم**: فروش رشد داشته\n\n- مورد اول\n- مورد دوم',
      }),
    ]);

    const { container } = render(
      <AuthProvider>
        <PageContextProvider>
          <TestWrapper />
        </PageContextProvider>
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Open Chat'));

    await waitFor(() => {
      expect(container.querySelector('strong')?.textContent).toBe('نکته مهم');
    });
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li').length).toBe(2);

    expect(screen.getByText('این *متن* کاربر است')).toBeInTheDocument();
    expect(screen.queryByText('متن')).not.toBeInTheDocument();
  });

  it('parses GFM tables in assistant messages', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([
      makeMsg({
        sender: 'ASSISTANT',
        message_content: '| ستون ۱ | ستون ۲ |\n| --- | --- |\n| مقدار ۱ | مقدار ۲ |',
      }),
    ]);

    const { container } = render(
      <AuthProvider>
        <PageContextProvider>
          <TestWrapper />
        </PageContextProvider>
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Open Chat'));

    await waitFor(() => {
      expect(container.querySelector('table')).toBeInTheDocument();
    });
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelectorAll('th').length).toBe(2);
    expect(container.querySelectorAll('td').length).toBe(2);
    expect(screen.getByText('ستون ۱')).toBeInTheDocument();
    expect(screen.getByText('مقدار ۲')).toBeInTheDocument();
  });

  it('clears chat via header button after confirmation', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([
      makeMsg({ message_content: 'پاسخ قبلی دستیار' }),
    ]);
    (api.clearChatHistory as any).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await openChat();

    await waitFor(() => {
      expect(screen.getByText('پاسخ قبلی دستیار')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن گفتگو' }));

    await waitFor(() => {
      expect(api.clearChatHistory).toHaveBeenCalledWith('session_default_user');
      expect(screen.queryByText('پاسخ قبلی دستیار')).not.toBeInTheDocument();
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });
  });

  it('keeps chat when clearing is cancelled', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([
      makeMsg({ message_content: 'پاسخ قبلی دستیار' }),
    ]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await openChat();

    await waitFor(() => {
      expect(screen.getByText('پاسخ قبلی دستیار')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن گفتگو' }));

    expect(api.clearChatHistory).not.toHaveBeenCalled();
    expect(screen.getByText('پاسخ قبلی دستیار')).toBeInTheDocument();
  });

  it('shows remaining and in-review credits when a wallet exists', async () => {
    (api.fetchBillingOverview as any).mockResolvedValue(
      makeBilling({
        monthly_balance: 120,
        purchased_balance: 30,
        pending_session_charge: 5,
        pending_account_charge: 2,
      })
    );

    await openChat();

    await waitFor(() => {
      expect(screen.getByText(/اعتبار مانده: ۱۵۰/)).toBeInTheDocument();
    });
    expect(screen.getByText(/در حال بررسی: ۷/)).toBeInTheDocument();
  });

  it('renders no quota indicator when wallet is null', async () => {
    (api.fetchBillingOverview as any).mockResolvedValue(makeBilling(null));

    await openChat();

    await waitFor(() => {
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/اعتبار مانده/)).not.toBeInTheDocument();
    expect(screen.queryByText(/در حال بررسی/)).not.toBeInTheDocument();
  });

  it('re-fetches billing after sending a message', async () => {
    (api.fetchBillingOverview as any).mockResolvedValue(makeBilling(null));
    (api.sendChatMessage as any).mockResolvedValue(
      makeMsg({ message_content: 'پاسخ هوش مصنوعی' })
    );

    await openChat();

    await waitFor(() => {
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });
    expect(api.fetchBillingOverview).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText('سوال خود درباره فروش را بپرسید...');
    fireEvent.change(input, { target: { value: 'سوال جدید' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(api.fetchBillingOverview).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps the chat working when the billing fetch fails', async () => {
    (api.fetchBillingOverview as any).mockRejectedValue(new Error('خطا در دریافت اطلاعات اشتراک و اعتبار'));
    (api.sendChatMessage as any).mockResolvedValue(
      makeMsg({ message_content: 'پاسخ هوش مصنوعی' })
    );

    await openChat();

    await waitFor(() => {
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/اعتبار مانده/)).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText('سوال خود درباره فروش را بپرسید...');
    fireEvent.change(input, { target: { value: 'سوال جدید' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('پاسخ هوش مصنوعی')).toBeInTheDocument();
    });
  });
});
