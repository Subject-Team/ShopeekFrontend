import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelegramSessionsCard } from '../TelegramSessionsCard';
import type { TelegramSession } from '../../../types';

const session: TelegramSession = {
  id: 'tg-1',
  telegram_chat_id: '123456789',
  created_at: '2026-09-01T10:30:00Z',
};

const renderCard = (props: Partial<React.ComponentProps<typeof TelegramSessionsCard>> = {}) => {
  const onUnlinkTelegram = vi.fn();
  render(
    <TelegramSessionsCard
      telegramSessions={[session]}
      loading={false}
      readOnly={false}
      revokingId={null}
      onUnlinkTelegram={onUnlinkTelegram}
      {...props}
    />
  );
  return { onUnlinkTelegram };
};

describe('TelegramSessionsCard', () => {
  it('renders the card title', () => {
    renderCard();

    expect(screen.getByText('اتصال به ربات تلگرام')).toBeInTheDocument();
    expect(screen.getByText(/دستگاه‌هایی که از طریق ربات تلگرام/)).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    renderCard({ loading: true });

    expect(screen.getByText('اتصال به ربات تلگرام')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an empty message when there are no sessions', () => {
    renderCard({ telegramSessions: [] });

    expect(screen.getByText('هنوز اتصالی به ربات تلگرام برقرار نشده است.')).toBeInTheDocument();
  });

  it('renders the session chat id and connection date', () => {
    renderCard();

    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText(/متصل از/)).toBeInTheDocument();
  });

  it('calls onUnlinkTelegram with the session id', () => {
    const { onUnlinkTelegram } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'قطع اتصال' }));
    expect(onUnlinkTelegram).toHaveBeenCalledWith('tg-1');
  });

  it('hides the unlink button in read-only mode', () => {
    renderCard({ readOnly: true });

    expect(screen.queryByRole('button', { name: 'قطع اتصال' })).not.toBeInTheDocument();
  });

  it('disables the unlink button while that session is being revoked', () => {
    renderCard({ revokingId: 'tg-1' });

    const btn = screen.getByRole('button', { name: 'قطع اتصال' });
    expect(btn).toBeDisabled();
  });
});