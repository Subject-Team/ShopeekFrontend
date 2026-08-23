import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatDrawer } from '../ChatDrawer';
import { PageContextProvider, usePageContext } from '../../../context/PageContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  fetchChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
}));

const TestWrapper: React.FC = () => {
  const { setIsChatOpen } = usePageContext();
  return (
    <div>
      <button onClick={() => setIsChatOpen(true)}>Open Chat</button>
      <ChatDrawer />
    </div>
  );
};

describe('ChatDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat drawer and sends message', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([]);
    (api.sendChatMessage as any).mockResolvedValue({
      id: 'msg-reply',
      session_id: 'session_default_user',
      sender: 'ASSISTANT',
      message_content: 'پاسخ هوش مصنوعی به سوال شما',
      created_at: new Date().toISOString(),
    });

    render(
      <PageContextProvider>
        <TestWrapper />
      </PageContextProvider>
    );

    // Open chat
    fireEvent.click(screen.getByText('Open Chat'));

    await waitFor(() => {
      expect(screen.getByText(/سلام! من دستیار هوشمند شاپیک هستم/i)).toBeInTheDocument();
    });

    // Type and send message
    const input = screen.getByPlaceholderText('سوال خود درباره فروش را بپرسید...');
    fireEvent.change(input, { target: { value: 'وضعیت فروش این ماه چطوره؟' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('وضعیت فروش این ماه چطوره؟')).toBeInTheDocument();
      expect(screen.getByText('پاسخ هوش مصنوعی به سوال شما')).toBeInTheDocument();
    });
  });
});
