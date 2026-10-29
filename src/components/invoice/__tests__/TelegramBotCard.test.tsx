// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TelegramBotCard } from '../TelegramBotCard';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  fetchSettings: vi.fn(),
}));

describe('[component] TelegramBotCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disconnected state when no telegram sessions exist', async () => {
    (api.fetchSettings as any).mockResolvedValue({
      telegram_sessions: [],
    });

    render(<TelegramBotCard />);

    expect(screen.getByText('ثبت فاکتور با ربات تلگرام')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('حسابی متصل نیست')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /ورود به ربات Shopeek_Bot@/i });
    expect(link).toHaveAttribute('href', 'https://t.me/Shopeek_Bot');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders connected state when telegram sessions are passed via props', () => {
    render(
      <TelegramBotCard
        sessions={[
          { id: 'ts-1', telegram_chat_id: '987654', created_at: '2026-03-20T10:00:00Z' },
        ]}
      />
    );

    expect(screen.getByText(/متصل به ربات/i)).toBeInTheDocument();
    expect(screen.getByText(/۱ حساب/i)).toBeInTheDocument();
  });

  it('opens and closes the Telegram info modal', async () => {
    render(<TelegramBotCard sessions={[]} />);

    const infoBtn = screen.getByRole('button', { name: /راهنمای ربات تلگرام/i });
    fireEvent.click(infoBtn);

    expect(screen.getByText('راهنمای ثبت فاکتور با ربات تلگرام')).toBeInTheDocument();
    expect(screen.getByText('ثبت سریع با متن روان (هوش مصنوعی)')).toBeInTheDocument();
    expect(screen.getByText(/ساعت مچی، احمد رضایی/i)).toBeInTheDocument();
    expect(screen.getByText('ثبت مرحله‌به‌مرحله')).toBeInTheDocument();
    expect(screen.getByText('تاریخ‌های شمسی دلخواه')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /^بستن$/ });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('راهنمای ثبت فاکتور با ربات تلگرام')).not.toBeInTheDocument();
  });
});
