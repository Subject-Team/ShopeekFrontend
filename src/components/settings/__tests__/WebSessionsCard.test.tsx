import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebSessionsCard } from '../WebSessionsCard';
import type { WebSession } from '../../../types';

const sessions: WebSession[] = [
  {
    id: 's-1',
    device_id: 'dev-1',
    device_label: 'Chrome on Linux',
    user_agent: 'Mozilla/5.0',
    ip: '1.2.3.4',
    login_at: '2026-09-01T10:00:00Z',
    last_seen_at: '2026-09-12T08:00:00Z',
  },
  {
    id: 's-2',
    device_id: 'dev-2',
    device_label: 'iPhone',
    user_agent: 'Safari',
    ip: '5.6.7.8',
    login_at: '2026-09-02T10:00:00Z',
    last_seen_at: '2026-09-11T20:00:00Z',
  },
];

const renderCard = (props: Partial<React.ComponentProps<typeof WebSessionsCard>> = {}) => {
  const onRevokeSession = vi.fn();
  const onRevokeAll = vi.fn();
  render(
    <WebSessionsCard
      webSessions={sessions}
      loading={false}
      readOnly={false}
      currentSessionId="s-1"
      revokingId={null}
      targetId={null}
      onRevokeSession={onRevokeSession}
      onRevokeAll={onRevokeAll}
      {...props}
    />
  );
  return { onRevokeSession, onRevokeAll };
};

describe('WebSessionsCard', () => {
  it('renders the card title', () => {
    renderCard();

    expect(screen.getByText('نشست‌های وب')).toBeInTheDocument();
    expect(screen.getByText(/دستگاه‌هایی که با حساب شما وارد شده‌اند/)).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    renderCard({ loading: true });

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an empty message when there are no sessions', () => {
    renderCard({ webSessions: [] });

    expect(screen.getByText('هنوز نشست وب فعالی ثبت نشده است.')).toBeInTheDocument();
  });

  it('renders sessions with device labels and marks the current device', () => {
    renderCard();

    expect(screen.getByText('Chrome on Linux')).toBeInTheDocument();
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText('دستگاه فعلی')).toBeInTheDocument();
    expect(screen.getAllByText(/آخرین فعالیت:/)).toHaveLength(2);
  });

  it('calls onRevokeSession with the session id', () => {
    const { onRevokeSession } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'خروج' }));
    expect(onRevokeSession).toHaveBeenCalledWith('s-2');
  });

  it('calls onRevokeAll from the revoke-all button', () => {
    const { onRevokeAll } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'خروج از سایر دستگاه‌ها' }));
    expect(onRevokeAll).toHaveBeenCalledTimes(1);
  });

  it('hides the revoke-all button when only one session exists', () => {
    renderCard({ webSessions: [sessions[0]] });

    expect(screen.queryByRole('button', { name: 'خروج از سایر دستگاه‌ها' })).not.toBeInTheDocument();
  });

  it('hides all action buttons in read-only mode', () => {
    renderCard({ readOnly: true });

    expect(screen.queryByRole('button', { name: 'خروج' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'خروج از سایر دستگاه‌ها' })).not.toBeInTheDocument();
  });

  it('disables the revoke button while that session is being revoked', () => {
    renderCard({ revokingId: 's-2' });

    expect(screen.getByRole('button', { name: 'خروج' })).toBeDisabled();
  });

  it('disables the revoke-all button while revoking all', () => {
    renderCard({ targetId: '__all__' });

    expect(screen.getByRole('button', { name: 'خروج از سایر دستگاه‌ها' })).toBeDisabled();
  });
});