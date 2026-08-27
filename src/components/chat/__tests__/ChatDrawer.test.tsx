import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatDrawer } from '../ChatDrawer';
import { PageContextProvider, usePageContext } from '../../../context/PageContext';
import { AuthProvider } from '../../../context/AuthContext';
import * as api from '../../../services/api';
import { ChatMessage } from '../../../types';

vi.mock('../../../services/api', () => ({
  fetchChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
  clearChatHistory: vi.fn(),
}));

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
};

describe('ChatDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
